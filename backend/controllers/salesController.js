import prisma from '../config/connection.js';

// FEFO Engine (First Expired First Out)
// Handles unified sales (OTC + Prescriptions)
export const processSale = async (req, res) => {
    try {
        const { items, patientId, paymentMethod, totalAmount } = req.body;
        // items: [{ medicineId, quantity, price, name }] 
        // Note: quantity is in Base Units (e.g. Tablets)

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in cart" });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Bill
            const invoiceNumber = `INV-${Date.now()}`;
            const bill = await tx.bill.create({
                data: {
                    invoiceNumber,
                    amount: totalAmount, // Should ideally be re-calculated server side for security
                    status: 'PAID',
                    type: 'PHARMACY',
                    patientId: patientId, // Can be a guest patient ID or null? Schema requires patientId.
                    // If patientId is missing, we might need a "Walk-in Customer" generic profile or make it nullable.
                    // For now, assuming patientId is provided or we handle guest logic.
                    paidDate: new Date(),
                    description: `Pharmacy Sale - ${paymentMethod}`
                }
            });

            // 2. Process Items & Deduct Stock
            for (const item of items) {
                let remainingQtyNeeded = parseInt(item.quantity);
                const medId = item.medicineId;

                // Find batches with stock, ordered by expiry (FEFO)
                // Filter out expired batches? Or allow selling with warning? 
                // Real world: don't sell expired.
                const batches = await tx.batch.findMany({
                    where: {
                        medicineId: medId,
                        quantity: { gt: 0 },
                        expiryDate: { gt: new Date() } // Not expired
                    },
                    orderBy: { expiryDate: 'asc' }
                });

                const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
                if (totalAvailable < remainingQtyNeeded) {
                    throw new Error(`Insufficient stock for ${item.name}. Available: ${totalAvailable}, Requested: ${remainingQtyNeeded}`);
                }

                // Deduction Loop
                for (const batch of batches) {
                    if (remainingQtyNeeded <= 0) break;

                    const deductAmount = Math.min(batch.quantity, remainingQtyNeeded);

                    // Update Batch
                    await tx.batch.update({
                        where: { id: batch.id },
                        data: { quantity: { decrement: deductAmount } }
                    });

                    // Create Bill Item (linked to specific batch)
                    await tx.billItem.create({
                        data: {
                            billId: bill.billId,
                            medicineId: medId,
                            batchId: batch.id,
                            quantity: deductAmount,
                            unitPrice: item.price, // Store unit price at time of sale
                            totalPrice: item.price * deductAmount,
                            name: item.name
                        }
                    });

                    // Log Movement (Optional, can rely on BillItem)
                    // await tx.inventoryLogs.create(...) 

                    remainingQtyNeeded -= deductAmount;
                }
            }

            return bill;
        });

        res.status(201).json({ message: "Sale processed successfully", invoice: result });

    } catch (error) {
        console.error("Error processing sale:", error);
        res.status(500).json({ message: error.message || "Failed to process sale" });
    }
};
