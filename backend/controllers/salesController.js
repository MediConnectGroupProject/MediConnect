import prisma from '../config/connection.js';

// FEFO Engine (First Expired First Out)
// Handles unified sales (OTC + Prescriptions)
export const processSale = async (req, res) => {
    try {
        const { items, patientId, paymentMethod } = req.body;
        // Ignore totalAmount from frontend payload for security, calculate it dynamically from DB

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in cart" });
        }

        const finalPatientId = patientId === "GUEST" ? null : patientId;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Pre-fetch all medicines to get accurate pricing
            const medIds = [...new Set(items.map(i => i.medicineId))];
            
            const medicines = await tx.medicine.findMany({
                where: { medicineId: { in: medIds } },
                select: { medicineId: true, name: true, price: true }
            });
            
            const medMap = new Map(medicines.map(m => [m.medicineId, m]));

            // Calculate total and prepare items using DB prices
            let calculatedTotal = 0;
            const processedItems = items.map(item => {
                const med = medMap.get(item.medicineId);
                if (!med) throw new Error(`Medicine ${item.name || item.medicineId} not found`);
                
                const itemPrice = parseFloat(med.price);
                const itemTotal = itemPrice * item.quantity;
                calculatedTotal += itemTotal;
                
                return {
                    ...item,
                    truePrice: itemPrice,
                    trueTotal: itemTotal,
                    dbName: med.name
                };
            });

            // 2. Create the Bill
            const invoiceNumber = `INV-${Date.now()}`;
            const bill = await tx.bill.create({
                data: {
                    invoiceNumber,
                    amount: calculatedTotal,
                    status: 'PAID',
                    type: 'PHARMACY',
                    patientId: finalPatientId, 
                    paidDate: new Date(),
                    description: `Pharmacy Sale - ${paymentMethod}`
                }
            });

            // 3. Pre-fetch all batches for the requested medicines
            // To fix N+1 query issue, query all batches upfront
            const batches = await tx.batch.findMany({
                where: {
                    medicineId: { in: medIds },
                    quantity: { gt: 0 },
                    expiryDate: { gt: new Date() } // Not expired
                },
                orderBy: { expiryDate: 'asc' } // FEFO
            });

            // Group batches by medicineId
            const batchMap = batches.reduce((map, batch) => {
                if (!map.has(batch.medicineId)) map.set(batch.medicineId, []);
                map.get(batch.medicineId).push(batch);
                return map;
            }, new Map());

            // 4. Process Items & Deduct Stock
            for (const item of processedItems) {
                let remainingQtyNeeded = parseInt(item.quantity);
                const medId = item.medicineId;

                const medsBatches = batchMap.get(medId) || [];
                
                const totalAvailable = medsBatches.reduce((sum, b) => sum + b.quantity, 0);
                if (totalAvailable < remainingQtyNeeded) {
                    throw new Error(`Insufficient stock for ${item.dbName}. Available: ${totalAvailable}, Requested: ${remainingQtyNeeded}`);
                }

                // Deduction Loop
                for (const batch of medsBatches) {
                    if (remainingQtyNeeded <= 0) break;

                    const deductAmount = Math.min(batch.quantity, remainingQtyNeeded);

                    // Update Batch
                    await tx.batch.update({
                        where: { id: batch.id },
                        data: { quantity: { decrement: deductAmount } }
                    });
                    
                    // Modify batch map in-memory to reflect new quantity in case same med appears twice
                    batch.quantity -= deductAmount;

                    // Create Bill Item
                    await tx.billItem.create({
                        data: {
                            billId: bill.billId,
                            medicineId: medId,
                            batchId: batch.id,
                            quantity: deductAmount,
                            unitPrice: item.truePrice,
                            totalPrice: item.truePrice * deductAmount,
                            name: item.dbName
                        }
                    });

                    // Log Movement
                    await tx.inventoryLogs.create({
                        data: {
                            medicineId: medId,
                            quantity: -deductAmount, // Negative for sale
                            changeType: 'SALE',
                            expiryDate: batch.expiryDate,
                            date: new Date(),
                            status: false
                        }
                    });

                    remainingQtyNeeded -= deductAmount;
                }
            }

            return { ...bill, originalAmount: calculatedTotal };
        });

        res.status(201).json({ message: "Sale processed successfully", invoice: result });

    } catch (error) {
        console.error("Error processing sale:", error);
        res.status(500).json({ message: error.message || "Failed to process sale" });
    }
};
