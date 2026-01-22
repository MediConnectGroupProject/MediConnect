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
export const getAppointments = async (date: Date | null, status: string, range?: { start: Date, end: Date }) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date.toISOString());
    if (range) {
        params.append('start', range.start.toISOString());
        params.append('end', range.end.toISOString());
    }
    if (status && status !== 'ALL') params.append('status', status);

    const res = await fetch(`${API_URL}/appointments?${params.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
}

// get doctor portal data (schedule, etc.)
// get doctor portal data (schedule, etc.)
export const getDoctorPortalData = async (date?: Date) => {
    // For now, we mainly need the schedule. 
    const targetDate = date || new Date();
    const appointments = await getAppointments(targetDate, 'ALL');
    
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
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update status');
    }
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
    if (!res.ok) {
        let errorInfo = `Error ${res.status}: ${res.statusText}`;
        try {
            const data = await res.json();
            if (data.message) errorInfo = data.message;
            if (data.stack) console.error("Backend Stack:", data.stack);
        } catch (e) {}
        throw new Error(errorInfo);
    }
    return res.json();
}

// get prescription requests
export const getPrescriptionRequests = async () => {
    const res = await fetch(`${API_URL}/prescriptions/requests`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch requests');
    return res.json();
}

// get availability
export const getAvailability = async () => {
    const res = await fetch(`${API_URL}/availability`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch availability');
    return res.json();
}

// update availability
export const updateAvailability = async (data: any) => {
    const res = await fetch(`${API_URL}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update availability');
    return res.json();
}

// get all patients
export const getPatients = async () => {
    const res = await fetch(`${API_URL}/patients`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
}

// create appointment
export const createAppointment = async (data: any) => {
    const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create appointment');
    return res.json();
}

// get doctor profile
export const getDoctorProfile = async () => {
    const res = await fetch(`${API_URL}/profile`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}

// update doctor profile
export const updateDoctorProfile = async (data: any) => {
    const res = await fetch(`${API_URL}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
}

// delete prescription
export const deletePrescription = async (id: string) => {
    const res = await fetch(`${API_URL}/prescriptions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to delete prescription');
    return res.json();
}

