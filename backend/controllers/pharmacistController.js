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
