import { z } from 'zod';


export const getAppointmentsSchema = z.object({
    query: z.object({
        date: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
        status: z.enum(['PENDING', 'CONFIRMED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']).optional(),
    })
});

export const updateAppointmentStatusSchema = z.object({
    params: z.object({
        appointmentId: z.string().min(1, 'Appointment ID is required'),
    }),
    body: z.object({
        status: z.enum(['PENDING', 'CONFIRMED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']),
    })
});

export const createPrescriptionSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient is required'),
        appointmentId: z.string().min(1, 'Appointment ID is required'),
        items: z.array(z.object({
            name: z.string().min(1, 'Item name is required'),
            dosage: z.string().min(1, 'Dosage is required'),
        })).min(1, 'Items are required'),
        notes: z.string().optional(),
        status: z.enum(['PENDING', 'VERIFIED', 'READY', 'DISPENSED', 'REJECTED']).optional()
    })
});


export const getPatientByIdSchema = z.object({
    params: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
    })
});

