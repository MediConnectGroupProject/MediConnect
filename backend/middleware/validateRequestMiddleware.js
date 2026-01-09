export const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        let errors = {};

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;

            for (const key in fieldErrors) {

                errors[key] = fieldErrors[key]?.[0] ?? '';
            }

            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        // attach validated & parsed data
        req.body = result.data;

        next();
    };
};