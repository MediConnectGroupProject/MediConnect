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
