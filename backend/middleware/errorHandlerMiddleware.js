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

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; 
    res.status(statusCode).json({
        message: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};