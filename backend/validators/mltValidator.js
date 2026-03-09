import z from "zod";

export const updateLabReportSchema = z.object({

    body: z.object({

        status: z
                .enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'READY']),
        results: z
            .string()
            .trim()
            .optional(),
        notes: z
            .string()
            .trim()
            .optional()
    }).strict(),
    params: z.object({

        reportId: z
            .string()
            .min(1, 'Report ID is required')
            .uuid('Invalid Report ID'),
    }).strict()
});