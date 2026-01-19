const API_URL = `${import.meta.env.VITE_API_URL}/doctor`;

// get doctor stats
export const getDoctorStats = async () => {
    const res = await fetch(`${API_URL}/stats`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}

// get appointments
export const getAppointments = async (date: Date | null, status: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date.toISOString());
    if (status && status !== 'ALL') params.append('status', status);

    const res = await fetch(`${API_URL}/appointments?${params.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
}

// get doctor portal data (schedule, etc.)
export const getDoctorPortalData = async () => {
    // For now, we mainly need the schedule. 
    // We can fetch today's appointments.
    const today = new Date();
    const appointments = await getAppointments(today, 'ALL');
    
    return {
        schedule: appointments
    };
}

// get up next appointment
export const getUpNextAppointment = async () => {
    const res = await fetch(`${API_URL}/appointments/up-next`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch next appointment');
    return res.json();
}

// update appointment status
export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    const res = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
}

// create prescription
export const createPrescription = async (data: any) => {
    const res = await fetch(`${API_URL}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create prescription');
    return res.json();
}
// get patient profile
export const getPatient = async (patientId: string) => {
    const res = await fetch(`${API_URL}/patients/${patientId}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch patient');
    return res.json();
}
