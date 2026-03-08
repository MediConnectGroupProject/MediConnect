import prisma from '../config/connection.js';

// get patient appointments
export const getMyAppointments = async (req, res) => {

        // req.user from passport middleware
        const { id: userId } = req.user;

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

        const { id: userId } = req.user;

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

        const { id: userId } = req.user;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json(notifications);

}

// get patient billing history
export const getBillingHistory = async (req, res) => {

        const { id: userId } = req.user;

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

// get all available doctors for booking
export const getAvailableDoctors = async (req, res) => {

    const doctors = await prisma.doctor.findMany({
        where: { availability: true },
        include: {
            user: {
                select: { firstName: true, lastName: true }
            }
        },
        orderBy: { doctorId: 'asc' }
    });

    res.status(200).json(doctors);

};

// get available time slots for a specific doctor on a specific date
export const getAvailableSlots = async (req, res) => {

    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
        return res.status(400).json({ message: 'doctorId and date are required' });
    }

    // Fetch doctor's working hours
    const doctor = await prisma.doctor.findUnique({
        where: { doctorId },
        select: { workingHours: true, availability: true }
    });

    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!doctor.availability) {
        return res.status(200).json({ slots: [], message: 'Doctor is not available' });
    }

    // Determine the day name from the date
    const dateObj = new Date(date);
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = DAY_NAMES[dateObj.getDay()];

    const workingHours = doctor.workingHours;
    if (!workingHours || !workingHours[dayName] || !workingHours[dayName].active) {
        return res.status(200).json({ slots: [], message: `Doctor is not available on ${dayName}s` });
    }

    const dayConfig = workingHours[dayName];
    const [startH, startM] = dayConfig.start.split(':').map(Number);
    const [endH, endM] = dayConfig.end.split(':').map(Number);

    // Generate all 30-minute slots within working hours
    const SLOT_DURATION_MIN = 30;
    const allSlots = [];
    let currentH = startH;
    let currentM = startM;

    while (currentH < endH || (currentH === endH && currentM < endM)) {
        const timeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
        allSlots.push(timeStr);
        currentM += SLOT_DURATION_MIN;
        if (currentM >= 60) {
            currentH += Math.floor(currentM / 60);
            currentM = currentM % 60;
        }
    }

    // Get already booked appointments for this doctor on this date
    const appointmentDate = new Date(date);
    const existingAppointments = await prisma.appointment.findMany({
        where: {
            doctorId,
            date: appointmentDate,
            status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
        },
        select: { time: true }
    });

    // Convert booked times to HH:MM strings for comparison
    const bookedTimes = new Set(
        existingAppointments.map(a => {
            const t = new Date(a.time);
            return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
        })
    );

    // Mark each slot as available or booked
    const slots = allSlots.map(time => ({
        time,
        available: !bookedTimes.has(time)
    }));

    res.status(200).json({ slots, dayName });

};

// book a new appointment
export const bookAppointment = async (req, res) => {

    const { id: userId } = req.user;
    const { doctorId, date, time } = req.body;

    if (!doctorId || !date || !time) {
        return res.status(400).json({ message: 'doctorId, date, and time are required' });
    }

    // Verify patient record exists
    const patient = await prisma.patient.findFirst({ where: { patientId: userId } });
    if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Validate doctor exists
    const doctor = await prisma.doctor.findUnique({ where: { doctorId } });
    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
    }

    // Parse date/time strings into proper Date objects
    const appointmentDate = new Date(date);
    const appointmentTime = new Date(`${date}T${time}`);

    // Conflict detection: check if doctor already has an appointment within a 30-min buffer window on same date
    const SLOT_BUFFER_MS = 30 * 60 * 1000; // 30 minutes
    const windowStart = new Date(appointmentTime.getTime() - SLOT_BUFFER_MS);
    const windowEnd = new Date(appointmentTime.getTime() + SLOT_BUFFER_MS);

    const existingAppointments = await prisma.appointment.findMany({
        where: {
            doctorId,
            date: appointmentDate,
            status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
        }
    });

    const conflicting = existingAppointments.find(a => {
        const t = new Date(a.time);
        return t >= windowStart && t <= windowEnd;
    });

    if (conflicting) {
        const conflictTime = new Date(conflicting.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return res.status(409).json({
            message: `This time slot is unavailable. The doctor already has an appointment near ${conflictTime}. Please choose a different time (at least 30 minutes apart).`
        });
    }

    const newAppointment = await prisma.appointment.create({
        data: {
            patientId: patient.patientId,
            doctorId,
            date: appointmentDate,
            time: appointmentTime,
            status: 'PENDING'
        },
        include: {
            doctor: {
                include: {
                    user: { select: { firstName: true, lastName: true } }
                }
            }
        }
    });

    res.status(201).json(newAppointment);

};

// cancel an appointment (only within 24 hours of creation)
export const cancelAppointment = async (req, res) => {

    const { id: userId } = req.user;
    const { id } = req.params;

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
        where: { appointmentId: id }
    });

    if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership — patient can only cancel their own
    if (appointment.patientId !== userId) {
        return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Only PENDING or CONFIRMED appointments can be canceled
    if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
        return res.status(400).json({ message: 'Only pending or confirmed appointments can be canceled' });
    }

    // Enforce 24-hour cancellation window from creation time
    const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;
    const now = new Date();
    const createdAt = new Date(appointment.createdAt);
    if (now - createdAt > CANCEL_WINDOW_MS) {
        return res.status(403).json({
            message: 'Cancellation window has passed. Appointments can only be canceled within 24 hours of booking.'
        });
    }

    const canceled = await prisma.appointment.update({
        where: { appointmentId: id },
        data: { status: 'CANCELED' }
    });

    res.status(200).json(canceled);

};
