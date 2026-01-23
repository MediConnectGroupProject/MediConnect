import prisma from '../config/connection.js';
import bcrypt from 'bcryptjs';

// get doctor stats
export const getDoctorStats = async (req, res) => {

        const { id: userId } = req.user;

        // get current date
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

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


}

// get appointments
export const getAppointments = async (req, res) => {

        const { id: userId } = req.user;
        const { date, start, end, status } = req.query;

        const whereClause = {
            doctorId: userId,
        };

        if (date) {
            //  console.log('Skipping date filter for debug');
            const queryDate = new Date(date);
            const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));

            const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
            
            whereClause.date = {
                gte: startOfDay,
                lte: endOfDay
            };
        } else if (start && end) {
            whereClause.date = {
                 gte: new Date(start),
                 lte: new Date(end)
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


}

// get up next appointment
export const getUpNextAppointment = async (req, res) => {

        const { id: userId } = req.user;
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0); 

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Check for Active Appointment (IN_PROGRESS)
        const activeAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId: userId,
                status: 'IN_PROGRESS',
                date: {
                    gte: startOfDay,
                    lte: endOfDay
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
            }
        });

        if (activeAppointment) {
            return res.status(200).json(activeAppointment);
        }

        // 2. If no active, get Up Next (PENDING)
        const appointment = await prisma.appointment.findFirst({
             where: {
                doctorId: userId,
                status: 'PENDING',
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            // Removed time restriction to show overdue/missed appointments as "Up Next"
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


}

// update appointment status
export const updateAppointmentStatus = async (req, res) => { 

        const { appointmentId } = req.params;
        const { status } = req.body;

         const updatedAppointment = await prisma.appointment.update({
            where: { appointmentId },
            data: { status }
        });

        res.status(200).json(updatedAppointment);


}

// create prescription
export const createPrescription = async (req, res) => {

        const { id: userId } = req.user; // Doctor ID
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


}
// get patient profile
export const getPatientById = async (req, res) => {

        const { patientId } = req.params;
        console.log(`[DEBUG] getPatientById called with ID: ${patientId}`);

        const patient = await prisma.patient.findUnique({
             where: { patientId },
             include: {
                 user: {
                     select: {
                         firstName: true,
                         lastName: true,
                         email: true,
                         phone: true,
                         prescriptions: {
                             orderBy: { issuedAt: 'desc' },
                             take: 5,
                             select: {
                                status: true,
                                prescriptionItems: {
                                    select: {
                                        medicineName: true,
                                        dosage: true
                                    }
                                }
                             }
                         }
                     }
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
            console.log(`[DEBUG] Patient not found for ID: ${patientId}`);
            return res.status(404).json({ message: 'Patient not found' });
        }
        console.log(`[DEBUG] Patient found: ${patient.user.firstName}`);

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
        if (patient.user.prescriptions) {
            patient.user.prescriptions.forEach(p => {
                if(p.status !== 'REJECTED') {
                     p.prescriptionItems.forEach(item => {
                         activeMeds.add(`${item.medicineName || 'Unknown Med'} ${item.dosage || ''}`.trim());
                     });
                }
            });
        }

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


}

// get prescription requests
export const getPrescriptionRequests = async (req, res) => {
    // Fetch all for visibility (demo mode)
    const requests = await prisma.prescription.findMany({
        include: {
           user: { select: { firstName: true, lastName: true } }, 
           prescriptionItems: true
        },
        orderBy: { issuedAt: 'desc' }
    });

    const mapped = requests.map(r => ({
        id: r.prescriptionId,
        patientName: `${r.user.firstName} ${r.user.lastName}`,
        status: r.status,
        prescriptionItems: r.prescriptionItems,
        issuedAt: r.issuedAt
    }));
    
    res.status(200).json(mapped);
}

// update availability
export const updateDoctorAvailability = async (req, res) => {
    const { id: userId } = req.user;
    const { availability, workingHours } = req.body; // Expecting workingHours as JSON

    const doctor = await prisma.doctor.update({
        where: { doctorId: userId },
        data: {
             availability,
             workingHours: workingHours ? workingHours : undefined 
        }
    });

    res.status(200).json(doctor);
}

export const getDoctorAvailability = async (req, res) => {
     const { id: userId } = req.user;
     const doctor = await prisma.doctor.findUnique({
         where: { doctorId: userId },
         select: { availability: true, workingHours: true }
     });
     res.status(200).json(doctor);
}

// get all patients for selection
// get all patients for selection
export const getPatients = async (req, res) => {
    const patients = await prisma.patient.findMany({
        include: { 
            user: { select: { firstName: true, lastName: true, phone: true } },
            appointments: {
                orderBy: { date: 'desc' },
                take: 1, // Last visit
                select: { date: true }
            }
        }
    });
    
    const mapped = patients.map(p => ({
        id: p.patientId,
        name: `${p.user.firstName} ${p.user.lastName}`,
        phone: p.user.phone || 'N/A',
        dob: p.dob,
        gender: p.gender,
        lastVisit: p.appointments[0]?.date || null
    }));
    
    res.status(200).json(mapped);
}

// create appointment
export const createAppointment = async (req, res) => {
    const { id: doctorId } = req.user;
    let { patientId, date, time, newPatient } = req.body;

    // Handle New Patient Creation
    if (newPatient) {
        try {
            const { firstName, lastName, gender, dob, phone } = newPatient;
            // Generate unique guest email
            const email = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}@mediconnect.local`;
            // Temporary password
            const password = await bcrypt.hash('123456', 10); // Default hash

            // Create User
            const user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password,
                    phone: phone || null,
                    status: 'ACTIVE',
                    isEmailVerified: true, // Auto-verify guest
                    roles: {
                        create: {
                            role: { connect: { name: 'PATIENT' } }
                        }
                    }
                }
            });

            // Create Patient
            await prisma.patient.create({
                data: {
                    user: { connect: { id: user.id } },
                    nic: null,
                    dob: new Date(dob),
                    address: null,
                    gender: gender.toUpperCase(), // Ensure Enum match
                }
            });

            patientId = user.id;
        } catch (error) {
            console.error("Error creating new patient:", error);
            return res.status(500).json({ message: "Failed to create new patient record" });
        }
    }

    if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
    }

    const appointment = await prisma.appointment.create({
        data: {
            patientId,
            doctorId,
            date: new Date(date),
            time: new Date(`${date}T${time}`),
            status: 'PENDING'
        }
    });
    res.status(201).json(appointment);
}

// get single prescription (public/shared)
export const getPrescriptionById = async (req, res) => {
    const { id } = req.params;
    const prescription = await prisma.prescription.findUnique({
        where: { prescriptionId: id },
        include: {
            user: { // Patient User
                select: { firstName: true, lastName: true, email: true, phone: true }
            },
            appointment: {
                include: {
                    doctor: {
                        include: {
                            user: { select: { firstName: true, lastName: true } }
                        }
                    }
                }
            },
            prescriptionItems: true
        }
    });

    if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json(prescription);
}

// delete prescription
export const deletePrescription = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.prescription.delete({
            where: { prescriptionId: id }
        });
        res.status(200).json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        console.error("Error deleting prescription:", error);
        res.status(500).json({ message: 'Failed to delete prescription' });
    }
}

// get doctor profile
export const getDoctorProfile = async (req, res) => {
    const { id: userId } = req.user;
    
    try {
        const doctor = await prisma.doctor.findUnique({
             where: { doctorId: userId },
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
        });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const profileData = {
            firstName: doctor.user.firstName,
            lastName: doctor.user.lastName,
            email: doctor.user.email,
            phone: doctor.user.phone || '', // User phone
            slmcRegNo: doctor.doctorId, // Assuming DoctorID is SLMC or similar, if not we need another field. But earlier used id.
            specialization: doctor.specialization,
            bio: doctor.bio || '',
            proficiency: doctor.proficiency || [], // JSON
            hospitals: doctor.hospitals || [], // JSON
            experience: doctor.experience || 0,
            educationalQualifications: doctor.qualifications || ''
        };

        res.status(200).json(profileData);
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
}

// update doctor profile
export const updateDoctorProfile = async (req, res) => {
    const { id: userId } = req.user;
    const { phone, bio, proficiency, hospitals, experience, educationalQualifications } = req.body;

    try {
        // Update User details (phone)
        if (phone !== undefined) {
             await prisma.user.update({
                 where: { id: userId },
                 data: { phone }
             });
        }

        // Update Doctor details
        const doctor = await prisma.doctor.update({
            where: { doctorId: userId },
            data: {
                bio,
                proficiency: proficiency, // Prisma handles JSON
                hospitals: hospitals, // Prisma handles JSON
                experience: parseInt(experience) || 0,
                qualifications: educationalQualifications // Mapping back
            }
        });

        res.status(200).json({ message: 'Profile updated successfully', doctor });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
}
