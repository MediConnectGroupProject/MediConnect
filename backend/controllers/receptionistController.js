import prisma from '../config/connection.js';

// Get Today's Appointments (All Doctors)
export const getDailyAppointments = async (req, res) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [appointments, total, pendingCount, activeCount] = await Promise.all([
        prisma.appointment.findMany({
            where: {
                date: {
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
                date: 'asc'
            },
            skip,
            take: limit
        }),
        prisma.appointment.count({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        }),
        prisma.appointment.count({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                },
                status: 'PENDING'
            }
        }),
        prisma.appointment.count({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                },
                status: {
                    in: ['WAITING', 'IN_PROGRESS']
                }
            }
        })
    ]);

    res.status(200).json({
        data: appointments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            pendingCount,
            activeCount
        }
    });

}

// Check-in Patient
export const checkInPatient = async (req, res) => {

    const { appointmentId } = req.params;
    const updated = await prisma.appointment.update({
        where: { appointmentId },
        data: { status: 'WAITING' } // Patient is in waiting room
    });
    res.status(200).json(updated);

}

// Confirm Appointment
export const confirmAppointment = async (req, res) => {

    const { appointmentId } = req.params;

    const appointment = await prisma.appointment.findUnique({
        where: { appointmentId }
    });

    if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

    const updated = await prisma.appointment.update({
        where: { appointmentId },
        data: { status: 'CONFIRMED' }
    });
    res.status(200).json(updated);

}

// Cancel Appointment
export const cancelAppointment = async (req, res) => {

    const { appointmentId } = req.params;

    const appointment = await prisma.appointment.findUnique({
        where: { appointmentId }
    });

    if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

    const updated = await prisma.appointment.update({
        where: { appointmentId },
        data: { status: 'CANCELED' }
    });
    res.status(200).json(updated);
}

// Complete Appointment
export const completeAppointment = async (req, res) => {
    const { appointmentId } = req.params;

    const appointment = await prisma.appointment.findUnique({
        where: { appointmentId }
    });

    if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

    const updated = await prisma.appointment.update({
        where: { appointmentId },
        data: { status: 'COMPLETED' }
    });
    res.status(200).json(updated);
}

export const getPendingBills = async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bills, total, totalAmount] = await Promise.all([
        prisma.bill.findMany({
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
                issuedDate: 'desc'
            },
            skip,
            take: limit
        }),
        prisma.bill.count({
            where: {
                status: 'PENDING'
            }
        }),
        prisma.bill.aggregate({
            where: {
                status: 'PENDING'
            },
            _sum: {
                amount: true
            }
        })
    ]);

    res.status(200).json({
        data: bills,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            totalAmount: totalAmount._sum.amount || 0
        }
    });

}

// Process Payment
export const processPayment = async (req, res) => {

    const { billId } = req.params;
    const { paymentMethod } = req.body;

    const bill = await prisma.bill.findUnique({
        where: { billId }
    });

    if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
    }

    const updated = await prisma.bill.update({
        where: { billId },
        data: {
            status: 'PAID',
            paidDate: new Date(),
            paymentMethod: paymentMethod || 'CASH'
        }
    });
    res.status(200).json(updated);

}

// Get Paid Invoices
export const getInvoices = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
        prisma.bill.findMany({
            where: {
                status: 'PAID'
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
                paidDate: 'desc'
            },
            skip,
            take: limit
        }),
        prisma.bill.count({
            where: {
                status: 'PAID'
            }
        })
    ]);

    res.status(200).json({
        data: invoices,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
}
