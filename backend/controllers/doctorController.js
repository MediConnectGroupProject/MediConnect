import prisma from '../config/connection.js';

// get doctor stats
export const getDoctorStats = async (req, res) => {
    try {
        const { userId } = req.user;

        // get current date
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // pending appointments
        const pendingAppointments = await prisma.appointment.count({
            where: {
                doctorId: userId,
                status: 'PENDING',
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        // patients seen
        const patientsSeen = await prisma.appointment.count({
            where: {
                doctorId: userId,
                status: 'COMPLETED',
                 date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        // total patients (unique patients seen by this doctor)
        const totalPatients = await prisma.appointment.findMany({
            where: {
                doctorId: userId,
                status: 'COMPLETED'
            },
            distinct: ['patientId']
        });
        
        // pending lab reports (linked to doctor's patients)
        const pendingLabs = await prisma.labReport.count({
            where: {
                doctorId: userId,
                status: 'PENDING'
            }
        });

        res.status(200).json({
            pendingAppointments,
            patientsSeen,
            pendingLabs,
            totalPatients: totalPatients.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// get appointments
export const getAppointments = async (req, res) => {
    try {
        const { userId } = req.user;
        const { date, status } = req.query;

        const whereClause = {
            doctorId: userId,
        };

        if (date) {
            const queryDate = new Date(date);
            const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
            
            whereClause.date = {
                gte: startOfDay,
                lte: endOfDay
            };
        }

        if (status && status !== 'ALL') {
             whereClause.status = status;
        }

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                time: 'asc'
            }
        });

        res.status(200).json(appointments);

    } catch (error) {
         console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// get up next appointment
export const getUpNextAppointment = async (req, res) => {
    try {
        const { userId } = req.user;
        const now = new Date();

        const appointment = await prisma.appointment.findFirst({
             where: {
                doctorId: userId,
                status: 'PENDING',
                date: {
                    gte: new Date(now.setHours(0, 0, 0, 0))
                },
                // assuming time is part of date-time or handled separately, prisma Time type is DateTime object usually
                 time: {
                    gte: now
                }
            },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            }
                        }
                    }
                }
            },
             orderBy: {
                time: 'asc'
            }
        });

        res.status(200).json(appointment);

    } catch (error) {
         console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// update appointment status
export const updateAppointmentStatus = async (req, res) => { 
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;

         const updatedAppointment = await prisma.appointment.update({
            where: { appointmentId },
            data: { status }
        });

        res.status(200).json(updatedAppointment);

    } catch (error) {
         console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// create prescription
export const createPrescription = async (req, res) => {
    try {
        const { userId } = req.user; // Doctor ID
        const { patientId, appointmentId, items, notes } = req.body;

        // Verify patient exists ? optional
        // Create prescription
        const prescription = await prisma.prescription.create({
            data: {
                userId: patientId, // The patient receiving the prescription
                appointmentId: appointmentId || null,
                notes: notes,
                status: 'PENDING',
                prescriptionItems: {
                    create: items.map((item) => ({
                        medicineName: item.name,
                        dosage: item.dosage,
                        duration: item.duration ? new Date(Date.now() + parseInt(item.duration) * 24 * 60 * 60 * 1000) : null, // Simplistic duration handling or store as string if schema allows. Schema says DateTime? for duration. 
                        // Wait, schema says `duration DateTime?`. That usually means "Until when". 
                        // If frontend sends "5 days", I should calculate end date or change schema to string.
                        // Let's assume for now I store it as null or calculate if possible.
                        // Actually, let's store instruction text in notes or instructions field.
                        instructions: `${item.frequency} - ${item.timing}. ${item.instructions || ''}`
                    }))
                }
            },
            include: {
                prescriptionItems: true
            }
        });

        res.status(201).json(prescription);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create prescription' });
    }
}
// get patient profile
export const getPatientById = async (req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await prisma.patient.findUnique({
             where: { patientId },
             include: {
                 user: {
                     select: {
                         firstName: true,
                         lastName: true,
                         email: true,
                         phone: true
                     }
                 },
                 prescriptions: {
                     include: {
                        prescriptionItems: true
                     },
                     orderBy: {
                        issuedAt: 'desc'
                     },
                     take: 5
                 },
                 labReports: {
                    take: 5,
                    orderBy: {
                        orderedDate: 'desc'
                    }
                 }
             }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Calculate Age
        const today = new Date();
        const birthDate = new Date(patient.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Derived Active Medications (from recent prescriptions)
        const activeMeds = new Set();
        patient.prescriptions.forEach(p => {
            if(p.status !== 'REJECTED') {
                 p.prescriptionItems.forEach(item => {
                     activeMeds.add(`${item.medicineName} ${item.dosage || ''}`.trim());
                 });
            }
        });

        const profileData = {
            id: patient.patientId,
            name: `${patient.user.firstName} ${patient.user.lastName}`,
            email: patient.user.email,
            phone: patient.user.phone || 'N/A',
            role: 'patient',
            age: age,
            gender: patient.gender === 'MALE' ? 'Male' : 'Female',
            bloodType: 'Unknown', // Not in schema
            allergies: [], // Not in schema
            medications: Array.from(activeMeds).slice(0, 5), // Top 5 recent unique meds
            conditions: [], // Not in schema
            joinedDate: new Date().toLocaleDateString() // Placeholder
        };

        res.status(200).json(profileData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
