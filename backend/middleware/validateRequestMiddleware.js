export const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            const errors = {
                body: {},
                params: {},
                query: {},
            };

            for (const issue of result.error.issues) {
                // example path: ['body', 'firstName']
                const [location, field] = issue.path;

                if (location && field) {
                    errors[location][field] = issue.message;
                }
            }

            // remove empty groups
            Object.keys(errors).forEach((key) => {
                if (Object.keys(errors[key]).length === 0) {
                    delete errors[key];
                }
            });

            return res.status(400).json({
                message: 'Validation failed',
                errors,
            });
        }

        req.body = result.data.body;
        Object.defineProperty(req, 'params', { value: result.data.params, writable: true });
        Object.defineProperty(req, 'query', { value: result.data.query, writable: true });

        next();
    };
};