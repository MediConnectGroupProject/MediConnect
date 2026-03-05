import prisma from '../config/connection.js';

export const logAction = async ({ userId, action, details, ip, req, status = 'SUCCESS' }) => {
  try {
    // If request object is passed, extract IP and UserAgent
    let ipAddress = ip;
    let userAgent = null;

    if (req) {
        ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        userAgent = req.headers['user-agent'];
        // If userId missing but present in req.user
        if (!userId && req.user) {
            userId = req.user.id;
        }
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress: ipAddress || 'unknown',
        userAgent,
        status
      }
    });
  } catch (error) {
    console.error('Audit Log Failed:', error);
    // Don't crash the app if logging fails
  }
};
