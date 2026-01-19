import prisma from '../config/connection.js';

// Get Today's Appointments (All Doctors)
export const getDailyAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await prisma.appointment.findMany({
            where: {
                dateTime: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                patient: {
                    include: { user: true }
                },
                doctor: {
                    include: { user: true }
                }
            },
            orderBy: {
                dateTime: 'asc'
            }
        });
        res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch appointments' });
    }
}

// Check-in Patient
export const checkInPatient = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const updated = await prisma.appointment.update({
            where: { appointmentId },
            data: { status: 'WAITING' } // Patient is in waiting room
        });
        res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to check in patient' });
    }
}

// Get Pending Bills
export const getPendingBills = async (req, res) => {
    try {
        const bills = await prisma.bill.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                patient: {
                    include: { user: true }
                },
                appointment: {
                    include: { doctor: { include: { user: true } } }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json(bills);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch pending bills' });
    }
}

// Process Payment
export const processPayment = async (req, res) => {
    try {
        const { billId } = req.params;
        const { paymentMethod } = req.body;

        const updated = await prisma.bill.update({
            where: { billId },
            data: { 
                status: 'PAID',
                paidAt: new Date(),
                paymentMethod: paymentMethod || 'CASH'
            }
        });
        res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to process payment' });
    }
}
