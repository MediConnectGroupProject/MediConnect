export const errorHandler = (err, req, res, next) => {

    console.error(err);

    // Prisma unique constraint error
    if (err.code === 'P2002') {
        return res.status(409).json({
            message: `${err.meta.target.join(', ')} already exists`
        });
    }

    // Zod validation error
    if (err.name === 'ZodError') {
        return res.status(400).json({
            errors: err.errors.map(e => e.message)
        });
    }

    res.status(500).json({
        message: 'Internal server error'
    });
};