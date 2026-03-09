import { z } from 'zod';

// check in schema for appointment
export const checkInSchema = z.object({
    params: z.object({
        appointmentId: z
                        .string()
                        .trim()
                        .cuid('Invalid appointment ID')
    }).strict()
});

// confirm schema for appointment
export const confirmSchema = z.object({
    params: z.object({
        appointmentId: z
                        .string()
                        .trim()
                        .cuid('Invalid appointment ID')
    }).strict()
}); 

// cancel schema for appointment
export const cancelSchema = z.object({
    params: z.object({
        appointmentId: z
                        .string()
                        .trim()
                        .cuid('Invalid appointment ID')
    }).strict()
});

// complete schema for appointment
export const completeSchema = z.object({
    params: z.object({
        appointmentId: z
                        .string()
                        .trim()
                        .cuid('Invalid appointment ID')
    }).strict()
});

// payment schema for bill
export const paymentSchema = z.object({
    params: z.object({
        billId: z
                .string()
                .trim()
                .cuid('Invalid bill ID')
    }).strict(),
    body: z.object({
            paymentMethod: z
                        .string()
                        .trim()
                        .min(1, 'Payment method is required')
    }).strict()
});

