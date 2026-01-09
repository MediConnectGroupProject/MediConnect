import z from 'zod';

// Registration validation schema
const registerSchema = z.object({

    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(200, 'First name must be at most 200 characters long'),
    lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(200, 'Last name must be at most 200 characters long'),
    email: z
        .string()
        .email('Invalid email address'),
    password: z
        .string()
        .trim()
        .min(6, 'Password must be at least 6 characters long'),
    phone: z
        .string()
        .min(9, 'Phone number must be at least 9 digits long')
        .max(20, 'Phone number must be at most 20 digits long')
        .optional()
});

// Login validation schema
const loginSchema = z.object({
    email: z
        .string()
        .email('Invalid email address'),
    password: z
        .string()
        .trim()
        .min(6, 'Password must be at least 6 characters long')
});

export {
    registerSchema,
    loginSchema
};