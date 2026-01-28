import prisma from '../config/connection.js';

// --- Supplier Management ---

export const addSupplier = async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address } = req.body;
        const supplier = await prisma.supplier.create({
            data: { name, contactPerson, email, phone, address }
        });
        res.status(201).json(supplier);
    } catch (error) {
        console.error("Error adding supplier:", error);
        res.status(500).json({ message: "Failed to add supplier" });
    }
};

export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({ 
            orderBy: { name: 'asc' } 
        });
        res.status(200).json(suppliers);
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        res.status(500).json({ message: "Failed to fetch suppliers" });
    }
};

// --- Batch Management ---

export const addBatch = async (req, res) => {
    try {
        const { medicineId, batchNumber, supplierId, quantity, expiryDate, unitCost } = req.body;

        // 1. Create the Batch
        const batch = await prisma.batch.create({
            data: {
                medicineId,
                batchNumber,
                supplierId: supplierId || null, // Optional supplier
                quantity: parseInt(quantity),
                originalQuantity: parseInt(quantity),
                expiryDate: new Date(expiryDate),
                unitCost: parseFloat(unitCost)
            }
        });

        // 2. Create Audit Log (using existing InventoryLogs for backward compatibility if needed, 
        // or we can rely solely on Batch + StockAdjustment in future. For now, logging to InventoryLogs is safe)
        await prisma.inventoryLogs.create({
            data: {
                medicineId,
                quantity: parseInt(quantity),
                changeType: 'STOCK_IN', // Matches your enum
                expiryDate: new Date(expiryDate),
                status: true
            }
        });

        res.status(201).json(batch);
    } catch (error) {
        console.error("Error adding batch:", error);
        res.status(500).json({ message: "Failed to add batch" });
    }
};

// Get Inventory with Batch Details
// This replaces the old simple getInventory
export const getInventoryWithBatches = async (req, res) => {
    try {
        let whereClause = {};
        let orderByClause = { name: 'asc' };
        let takeClause = undefined;

        // --- POPULAR ITEMS LOGIC ---
        if (req.query.popular === 'true') {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
            
            // 1. Aggregate Sales from BillItems for PAID bills in last 2h
            const topSales = await prisma.billItem.groupBy({
                by: ['medicineId'],
                where: {
                    bill: {
                        status: 'PAID',
                        paidDate: { gte: twoHoursAgo }
                    }
                },
                _sum: {
                    quantity: true
                },
                orderBy: {
                    _sum: {
                        quantity: 'desc'
                    }
                },
                take: 10
            });

            if (topSales.length > 0) {
                const topIds = topSales.map(s => s.medicineId);
                whereClause = {
                    medicineId: { in: topIds }
                };
                // We want to maintain the order of popularity if possible, or just return them
                // Prisma 'in' filter doesn't guarantee order, but for <10 items client-side sort or just loose order is fine.
                orderByClause = undefined; 
                takeClause = 10;
            } else {
                 // No sales in last 2h? Return default top 10 by name? Or just 10 random
                 takeClause = 10;
            }
        }

        const medicines = await prisma.medicine.findMany({
            where: whereClause,
            take: takeClause,
            orderBy: orderByClause,
            include: {
                batches: {
                    where: { quantity: { gt: 0 } }, // Only show batches with stock
                    orderBy: { expiryDate: 'asc' }  // FEFO: Earliest expiry first
                },
                medicineCategory: true,
                medicineDosage: true
            }
        });

        // Calculate total stock dynamically from batches
        const inventory = medicines.map(med => {
            const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);
            
            // We return a structure compatible with the frontend, but with added 'batches' array
            return {
                medicineId: med.medicineId,
                name: med.name,
                description: med.description,
                price: med.price,
                stock: totalStock, // Calculated!
                allowSplit: med.allowSplit,
                category: med.medicineCategory?.name || 'Uncategorized',
                dosage: med.medicineDosage?.name || 'N/A',
                batches: med.batches
            };
        });

        res.status(200).json(inventory);
    } catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(500).json({ message: "Failed to fetch inventory" });
    }
};

// Get Alerts (Low Stock & Expiring)
export const getInventoryAlerts = async (req, res) => {
    try {
        const LOW_STOCK_THRESHOLD = parseInt(req.query.threshold) || 50;
        const EXPIRY_DAYS = parseInt(req.query.days) || 90; // Default 3 months

        // 1. Low Stock
        const lowStockItems = await prisma.medicine.findMany({
            where: {
                stock: { lt: LOW_STOCK_THRESHOLD }
            },
            select: {
                medicineId: true,
                name: true,
                stock: true,
                medicineCategory: { select: { name: true } },
                suppliers: { select: { name: true }, take: 1 } // Naive supplier check
            }
        });

        // 2. Expiring Batches
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + EXPIRY_DAYS);

        const expiringBatches = await prisma.batch.findMany({
            where: {
                expiryDate: {
                    gte: today,
                    lte: futureDate
                },
                quantity: { gt: 0 } // Only warn if we actually have stock of it
            },
            include: {
                medicine: { select: { name: true } },
                supplier: { select: { name: true } }
            },
            orderBy: { expiryDate: 'asc' }
        });

        res.status(200).json({
            lowStock: lowStockItems.map(item => ({
                id: item.medicineId,
                name: item.name,
                stock: item.stock,
                threshold: LOW_STOCK_THRESHOLD,
                category: item.medicineCategory?.name || 'General',
                supplier: item.suppliers[0]?.name || 'N/A'
            })),
            expiring: expiringBatches.map(batch => ({
                id: batch.id,
                batchNumber: batch.batchNumber,
                medicineName: batch.medicine.name,
                expiryDate: batch.expiryDate,
                quantity: batch.quantity,
                supplier: batch.supplier?.name || 'N/A'
            }))
        });

    } catch (error) {
        console.error("Error fetching alerts:", error);
        res.status(500).json({ message: "Failed to fetch alerts" });
    }
};
