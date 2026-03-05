
export const requireRole = (allowedRoles = []) => {


    return (req, res, next) => {
        const userRoles = (req.user?.roles || []).map(r => r.toUpperCase());
        const required = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).map(r => r.toUpperCase());

        const hasRole = userRoles.some(role => required.includes(role));

        if (!hasRole) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};