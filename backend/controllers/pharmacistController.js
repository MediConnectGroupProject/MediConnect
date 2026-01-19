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

        const inventory = await prisma.medicine.findMany({
            include: {
                medicineCategory: true,
                medicineDosage: true
            }
        });
        res.status(200).json(inventory);

}
