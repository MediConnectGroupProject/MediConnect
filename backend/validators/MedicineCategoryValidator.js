import z from 'zod';


// validate insert request
export const addMedicineCatSchema = z.object({

    name: z
        .string()
        .trim()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    description: z
        .string()
        .trim()
        .min(1, 'Description is required')
        .max(1000, 'Description must be less than 1000 characters')
        .optional(),
});

// validate update request
