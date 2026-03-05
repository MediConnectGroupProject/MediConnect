import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all suppliers (Admin route)
export const getAllSuppliers = async (req, res, next) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(suppliers);
    } catch (error) {
        next(error);
    }
};

// Create a new supplier
export const addSupplier = async (req, res, next) => {
    try {
        const { name, contactPerson, email, phone, address, licenseNumber, rating, notes } = req.body;

        if (!name) {
            return res.status(400).json({ status: 'fail', message: 'Supplier name is required' });
        }

        const newSupplier = await prisma.supplier.create({
            data: {
                name,
                contactPerson,
                email,
                phone,
                address,
                licenseNumber,
                rating: rating ? parseInt(rating) : null,
                notes,
                isActive: true
            }
        });

        res.status(201).json({
            status: 'success',
            data: newSupplier
        });

    } catch (error) {
        next(error);
    }
};

// Update a supplier (Rating, Notes, etc)
export const updateSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, notes } = req.body;

        const updatedSupplier = await prisma.supplier.update({
            where: { id },
            data: {
                rating: rating ? parseInt(rating) : null,
                notes
            }
        });

        res.status(200).json({
            status: 'success',
            data: updatedSupplier
        });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ status: 'fail', message: 'Supplier not found' });
        }
        next(error);
    }
};

// Toggle Supplier Active Status
export const updateSupplierStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ status: 'fail', message: 'isActive must be a boolean' });
        }

        const updatedSupplier = await prisma.supplier.update({
            where: { id },
            data: { isActive }
        });

        res.status(200).json({
            status: 'success',
            message: `Supplier marked as ${isActive ? 'Active' : 'Inactive'}`,
            data: updatedSupplier
        });

    } catch (error) {
         if (error.code === 'P2025') {
            return res.status(404).json({ status: 'fail', message: 'Supplier not found' });
        }
        next(error);
    }
};



