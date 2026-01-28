import prisma from '../config/connection.js';

// Get all prescriptions (for verification/dispensing)
export const getPrescriptionQueue = async (req, res) => {

    const queue = await prisma.prescription.findMany({
        where: {
            status: {
                in: ['PENDING', 'VERIFIED', 'READY', 'DISPENSED']
            }
        },
        include: {
            user: { // Patient
                select: {
                    firstName: true,
                    lastName: true
                }
            },
            appointment: {
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                }
            },
            prescriptionItems: true
        },
        orderBy: {
            issuedAt: 'desc'
        }
    });
    res.status(200).json(queue);

}

// Update prescription status
export const updatePrescriptionStatus = async (req, res) => {

    const { prescriptionId } = req.params;
    const { status } = req.body;

    const updated = await prisma.prescription.update({
        where: { prescriptionId },
        data: { status }
    });

    // Use Inventory Logs to deduct stock if dispensed (TODO: Add complex logic later)
    if (status === 'DISPENSED') {
        // Logic to deduct stock would go here
    }

    res.status(200).json(updated);

}

// Get Inventory
export const getInventory = async (req, res) => {

    const inventory = await prisma.inventoryLogs.findMany({
        include: {
            medicine: true,
        }
    });

    res.status(200).json(inventory);
}

// Add inventory
export const addInventory = async (req, res) => {

    const { medicineId, quantity, changeType ,expiryDate } = req.body;

    const added = await prisma.inventoryLogs.create({
        data: {
            medicineId,
            quantity,
            changeType: changeType,
            expiryDate: expiryDate
        }
    });

    let updateMedicineStock;
    if (changeType === 'STOCK_IN'|| changeType === 'ADJUSTMENT') {
        
        updateMedicineStock = await prisma.medicine.update({
            where: { medicineId },
            data: {
                stock: {
                    increment: quantity
                }
            }
        });
    } else {

        updateMedicineStock = await prisma.medicine.update({
            where: { medicineId },
            data: {
                stock: {
                    decrement: quantity
                }
            }
        });
    }

    res.status(201).json({
        message: 'Inventory added successfully',
        added,
        updateMedicineStock
    });
}

// update inventory
export const updateInventory = async (req, res) => {

    const { inventoryId } = req.params;
    const { medicineId, quantity, changeType ,expiryDate } = req.body;

    const isAvailable = await prisma.inventoryLogs.findUnique({
        where: { inventoryLogId: inventoryId },
    });

    if (!isAvailable) {
        return res.status(404).json({ message: 'Inventory not found' });
    }

    const updated = await prisma.inventoryLogs.update({
        where: { inventoryLogId: inventoryId },
        data: {
            medicineId: medicineId,
            quantity: quantity,
            changeType: changeType,
            expiryDate: expiryDate
        }
    });

    let updateMedicineStock;
    if (changeType === 'STOCK_IN'|| changeType === 'ADJUSTMENT') {
        
        updateMedicineStock = await prisma.medicine.update({
            where: { medicineId },
            data: {
                stock: {
                    increment: quantity
                }
            }
        });
    } else {

        updateMedicineStock = await prisma.medicine.update({
            where: { medicineId },
            data: {
                stock: {
                    decrement: quantity
                }
            }
        });
    }

    res.status(201).json({
        message: 'Inventory updated successfully',
        updated,
        updateMedicineStock
    });

}

// add dosage
export const addDosage = async (req, res) => {

    const { name, defaultUnit } = req.body;

    const dosage = await prisma.dosageForms.create({
        data: {
            name,
            defaultUnit
        }
    });

    res.status(201).json({
        message: 'Dosage added successfully',
        dosage
    });
}

// update dosage
export const updateDosage = async (req, res) => {

    const { dosageId } = req.params;
    const { name, defaultUnit } = req.body;

    const isAvailable = await prisma.dosageForms.findUnique({
        where: { dosageId },
    });

    if (!isAvailable) {
        return res.status(404).json({ message: 'Dosage not found' });
    }

    const updated = await prisma.dosageForms.update({
        where: { dosageId },
        data: {
            name,
            defaultUnit
        }
    });

    res.status(201).json({
        message: 'Dosage updated successfully',
        updated
    });
}

// get dosage
export const getDosage = async (req, res) => {

    const dosage = await prisma.dosageForms.findMany();

    res.status(200).json(dosage);
}

// add category
export const addCategory = async (req, res) => {

    const { name, description } = req.body;

    const category = await prisma.medicineCategory.create({
        data: {
            name,
            description
        }
    });

    res.status(201).json({
        message: 'Category added successfully',
        category
    });
}

// update category
export const updateCategory = async (req, res) => {

    const { categoryId } = req.params;
    const { name, description } = req.body;

    const isAvailable = await prisma.medicineCategory.findUnique({
        where: { categoryId },
    });

    if (!isAvailable) {
        return res.status(404).json({ message: 'Category not found' });
    }

    const updated = await prisma.medicineCategory.update({
        where: { categoryId },
        data: {
            name,
            description
        }
    });

    res.status(201).json({
        message: 'Category updated successfully',
        updated
    });
}

// get category
export const getCategory = async (req, res) => {

    const category = await prisma.medicineCategory.findMany();

    res.status(200).json(category);
}

// add medicine
export const addMedicine = async (req, res) => {

    const { name, description, price, categoryId, dosageId } = req.body;

    // validate availability of req data
    const isCategoryAvailable = await prisma.medicineCategory.findUnique({
        where: {
            categoryId
        }
    });

    if (!isCategoryAvailable) {

        return res.status(404).json({ message: 'Category not found' });
    }

    const isDosageAvailable = await prisma.dosageForms.findUnique({
        where: {
            dosageId
        }
    });

    if (!isDosageAvailable) {

        return res.status(404).json({ message: 'Dosage not found' });
    }

    // insert data
    const medicine = await prisma.medicine.create({
        data: {
            name,
            description,
            price,
            categoryId,
            dosageId
        }
    });

    res.status(201).json({
        message: 'Medicine added successfully',
        medicine
    });
}

// update medicine
export const updateMedicine = async (req, res) => {

    const { medicineId } = req.params;
    const { name, description, price, categoryId, dosageId } = req.body;

    // validate availability of req data
    const isAvailable = await prisma.medicine.findUnique({
        where: { medicineId },
    });

    if (!isAvailable) {
        return res.status(404).json({ message: 'Medicine not found' });
    }

    const isCategoryAvailable = await prisma.medicineCategory.findUnique({
        where: {
            categoryId
        }
    });

    if (!isCategoryAvailable) {

        return res.status(404).json({ message: 'Category not found' });
    }

    const isDosageAvailable = await prisma.dosageForms.findUnique({
        where: {
            dosageId
        }
    });

    if (!isDosageAvailable) {

        return res.status(404).json({ message: 'Dosage not found' });
    }

    // update data
    const updated = await prisma.medicine.update({
        where: { medicineId },
        data: {
            name,
            description,
            price,
            categoryId,
            dosageId
        }
    });

    res.status(201).json({
        message: 'Medicine updated successfully',
        updated
    });
}
// Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Date range for 7-day trend (Use 7 full days ago from midnight)
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7); // Go back 7 days to cover full week
        sevenDaysAgo.setHours(0,0,0,0);

        const [
            pendingCount,
            lowStockCount,
            readyCount,
            todaysSalesAggregate,
            recentPrescriptions,
            lowStockItems,
            weeksBills
        ] = await Promise.all([
            // 1. Pending Count
            prisma.prescription.count({ where: { status: { in: ['PENDING', 'VERIFIED'] } } }),
            
            // 2. Low Stock Count
            prisma.medicine.count({ where: { stock: { lt: 10 } } }),
            
            // 3. Ready Count
            prisma.prescription.count({ where: { status: 'READY' } }),
            
            // 4. Today's Revenue
            prisma.bill.aggregate({
                _sum: { amount: true },
                where: { type: 'PHARMACY', status: 'PAID', paidDate: { gte: today } }
            }),

            // 5. Recent Prescriptions (Limit 5)
            prisma.prescription.findMany({
                where: { status: { in: ['PENDING', 'VERIFIED'] } },
                take: 5,
                orderBy: { issuedAt: 'desc' },
                include: { user: { select: { firstName: true, lastName: true } } }
            }),

            // 6. Top Low Stock Items (Limit 5)
            prisma.medicine.findMany({
                where: { stock: { lt: 10 } },
                take: 5,
                orderBy: { stock: 'asc' },
                select: { name: true, stock: true }
            }),

            // 7. Last 7 Days Bills for Graph
            prisma.bill.findMany({
                where: {
                    type: 'PHARMACY',
                    status: 'PAID',
                    paidDate: { gte: sevenDaysAgo }
                },
                orderBy: { paidDate: 'asc' },
                select: { amount: true, paidDate: true }
            })
        ]);

        const todaysRevenue = Number(todaysSalesAggregate._sum.amount || 0);

        // Process Weeks Bills into Daily Totals [ { date: 'Mon', amount: 120 }, ... ]
        const salesTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0,0,0,0);
            
            const nextD = new Date(d);
            nextD.setDate(d.getDate() + 1);

            // Filter bills for this specific day
            const dailyTotal = weeksBills
                .filter(b => {
                    const bDate = new Date(b.paidDate);
                    return bDate >= d && bDate < nextD; // Strict day bucketing
                })
                .reduce((sum, b) => {
                    // Handle Prisma Decimal or Number
                    const val = (b.amount && typeof b.amount === 'object' && 'toNumber' in b.amount) 
                        ? b.amount.toNumber() 
                        : Number(b.amount || 0);
                    return sum + val;
                }, 0);
            
            salesTrend.push({
                date: d.toLocaleDateString('en-US', { weekday: 'short' }), // e.g., "Mon"
                fullDate: d.toISOString(),
                amount: dailyTotal
            });
        }
        
        // Debugging Log to verify data flow
        // console.log(`Stats Loaded: LowStock(${lowStockItems.length}), Sales(${weeksBills.length} bills), Trend(Last: ${salesTrend[6].amount})`);

        res.status(200).json({
            // Counts
            prescriptionRequests: pendingCount,
            lowStockAlerts: lowStockCount,
            readyForPickup: readyCount,
            todaysSales: todaysRevenue,
            
            // Lists & Graphs
            recentPrescriptions: recentPrescriptions.map(p => ({
                id: p.prescriptionId,
                patient: `${p.user.firstName} ${p.user.lastName}`,
                date: p.issuedAt,
                status: p.status
            })),
            lowStockList: lowStockItems,
            salesTrend: salesTrend
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Failed to load dashboard statistics" });
    }
}
