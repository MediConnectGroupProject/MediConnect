import z from 'zod';

// validate category insert request
export const addMedicineCatSchema = z.object({

    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, 'Name is required')
            .max(100, 'Name must be less than 100 characters'),
        description: z
            .string()
            .trim()
            .max(1000, 'Description must be less than 1000 characters')
            .optional(),
    }).strict(),
});

// validate category update request
export const updateMedicineCatSchema = z.object({

    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, 'Name is required')
            .max(100, 'Name must be less than 100 characters'),
        description: z
            .string()
            .trim()
            .max(1000, 'Description must be less than 1000 characters')
            .optional(),
    }).strict(),
    params: z.object({
        categoryId: z
            .coerce
            .number()
            .int()
            .min(1, 'Category ID is required'),
    }).strict()
});

// validate dosage insert request
export const addDosageSchema = z.object({

    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, 'Name is required')
            .max(100, 'Name must be less than 100 characters'),
        defaultUnit: z.enum(['mg', 'ml', 'drops', 'capsule', 'tablet'])
    }).strict(),
});

// validate dosage update request
export const updateDosageSchema = z.object({

    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, 'Name is required')
            .max(100, 'Name must be less than 100 characters'),
        defaultUnit: z.enum(['mg', 'ml', 'drops', 'capsule', 'tablet'])
    }).strict(),
    params: z.object({
        dosageId: z
            .coerce
            .number()
            .int()
            .min(1, 'Dosage ID is required'),
    }).strict()
});

// validate inventory insert request
export const addInventorySchema = z.object({

    body: z.object({
        medicineId: z
            .string()
            .min(1, 'Medicine ID is required'),
        quantity: z
            .coerce
            .number()
            .int()
            .min(1, 'Quantity is required'),
        expiryDate: z
            .coerce
            .date()
            .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Expiry date cannot be in the past'),
        changeType: z.enum(['STOCK_IN', 'SALE', 'RETURN', 'EXPIRED', 'PRESCRIPTION_DISPENSED', 'ADJUSTMENT'])
    }).strict(),
});

// validate inventory update request
export const updateInventorySchema = z.object({

    body: z.object({
        medicineId: z
            .string()
            .min(1, 'Medicine ID is required'),
        quantity: z
            .coerce
            .number()
            .int()
            .min(1, 'Quantity is required'),
        expiryDate: z
            .coerce
            .date()
            .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Expiry date cannot be in the past'),
        changeType: z.enum(['STOCK_IN', 'SALE', 'RETURN', 'EXPIRED', 'PRESCRIPTION_DISPENSED', 'ADJUSTMENT'])
    }).strict(),
    params: z.object({
        inventoryId: z
            .string()
            .min(1, 'Inventory ID is required'),
    }).strict()
});

// validate medicine insert request
export const addMedicineSchema = z.object({

    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, 'Name is required')
            .max(100, 'Name must be less than 100 characters'),
        description: z
            .string()
            .trim()
            .max(1000, 'Description must be less than 1000 characters')
            .optional(),
        price: z
            .coerce
            .number()
            .positive('Price must be positive')
            .min(1, 'Price is required'),
        categoryId: z
            .coerce
            .number()
            .int()
            .min(1, 'Category ID is required'),
        dosageId: z
            .coerce
            .number()
            .int()
            .min(1, 'Dosage ID is required'),
    }).strict(),
});

// validate medicine update request
export const updateMedicineSchema = z.object({

    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, 'Name is required')
            .max(100, 'Name must be less than 100 characters'),
        description: z
            .string()
            .trim()
            .max(1000, 'Description must be less than 1000 characters')
            .optional(),
        price: z
            .coerce
            .number('Price must be number')
            .positive('Price must be positive')
            .min(1, 'Price is required'),
        categoryId: z
            .coerce
            .number()
            .int()
            .min(1, 'Category ID is required'),
        dosageId: z
            .coerce
            .number()
            .int()
            .min(1, 'Dosage ID is required'),
    }).strict(),
    params: z.object({
        medicineId: z
            .string()
            .min(1, 'Medicine ID is required'),
    }).strict()
});
