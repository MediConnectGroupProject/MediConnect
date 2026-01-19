import prisma from "../config/connection.js";

// check medicine stock before dispensing
export const checkStock = async (req, res, next) => {
    try {
        const {
            medicineId,
            quantity
        } = req.body;

        const medicine = await prisma.medicine.findUnique({
            where: {
                medicineId
            },
        });

        if (!medicine) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        if (medicine.stock < quantity) {
            return res.status(400).json({
                message: "Not enough stock"
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

// log inventory changes
export const logInventoryChange = async ({
    medicineId,
    changeType,
    quantity,
}) => {
    return prisma.inventoryLogs.create({
        data: {
            medicineId,
            changeType,
            quantity,
        },
    });
};