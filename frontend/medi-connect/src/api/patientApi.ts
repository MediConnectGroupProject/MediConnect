const API_URL = `${import.meta.env.VITE_API_URL}/patient`;

// get my appointments
export const getMyAppointments = async () => {
    const res = await fetch(`${API_URL}/appointments`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
}

// get my prescriptions
export const getMyPrescriptions = async () => {
    const res = await fetch(`${API_URL}/prescriptions`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch prescriptions');
    return res.json();
}

// get notifications
export const getNotifications = async () => {
    const res = await fetch(`${API_URL}/notifications`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
}

// get billing history
export const getBillingHistory = async () => {
    const res = await fetch(`${API_URL}/billing`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch billing');
    return res.json();
}

// get all available doctors for booking
export const getAvailableDoctors = async () => {
    const res = await fetch(`${API_URL}/doctors`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
}

// get available time slots for a doctor on a specific date
export const getAvailableSlots = async (doctorId: string, date: string) => {
    const res = await fetch(`${API_URL}/doctors/${doctorId}/slots?date=${date}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch slots');
    return res.json();
}

// book a new appointment
export const bookAppointment = async (data: { doctorId: string; date: string; time: string }) => {
    const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Failed to book appointment');
    return body;
}

// cancel an appointment
export const cancelAppointment = async (id: string) => {
    const res = await fetch(`${API_URL}/appointments/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Failed to cancel appointment');
    return body;
}

