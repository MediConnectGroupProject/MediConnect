import prisma from '../config/connection.js';

// get patient appointments
export const getMyAppointments = async (req, res) => {

        // req.user from passport middleware
        const { userId } = req.user;

        // Find patient record linked to this user
        const patient = await prisma.patient.findFirst({
            where: { patientId: userId }
        });

        if (!patient) {
             return res.status(404).json({ message: 'Patient profile not found' });
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                patientId: patient.patientId
            },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            }
                        }
                    }
                },
                prescriptions: true 
            },
            orderBy: {
                date: 'desc'
            }
        });

        res.status(200).json(appointments);


}

// get patient prescriptions
export const getMyPrescriptions = async (req, res) => {

        const { userId } = req.user;

        const prescriptions = await prisma.prescription.findMany({
            where: {
                userId: userId // Prescription is linked to User directly in schema
            },
            include: {
                appointment: {
                    include: {
                        doctor: {
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                },
                prescriptionItems: true
            },
             orderBy: {
                issuedAt: 'desc'
            }
        });

         res.status(200).json(prescriptions);


}

// get patient notifications
export const getNotifications = async (req, res) => {

        const { userId } = req.user;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json(notifications);

}

// get patient billing history
export const getBillingHistory = async (req, res) => {

        const { userId } = req.user;

        // Find patient record
        const patient = await prisma.patient.findFirst({
            where: { patientId: userId }
        });

        if (!patient) {
             return res.status(404).json({ message: 'Patient profile not found' });
        }

        const bills = await prisma.bill.findMany({
            where: { patientId: patient.patientId },
            orderBy: { issuedDate: 'desc' }
        });

        res.status(200).json(bills);

}
