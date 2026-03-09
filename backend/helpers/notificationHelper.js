import prisma from '../config/connection.js';

/**
 * Create a notification for a patient.
 * @param {string} userId      - The User.id of the recipient (patient)
 * @param {string} type        - Notification type constant
 * @param {string} message     - Human-readable message
 * @param {string|null} referenceId - Optional prescriptionId or appointmentId for action buttons
 */
export const createNotification = async (userId, type, message, referenceId = null) => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                referenceId,
            }
        });
    } catch (err) {
        // Notifications are non-critical — log but don't throw
        console.error('[Notification] Failed to create notification:', err.message);
    }
};
