const API_URL = `${import.meta.env.VITE_API_URL}/receptionist`;

// Get Today's Appointments
export const getDailyAppointments = async (page = 1, limit = 10) => {
    const res = await fetch(`${API_URL}/appointments/today?page=${page}&limit=${limit}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
}

// Check-in Patient
export const checkInPatient = async (appointmentId: string) => {
    const res = await fetch(`${API_URL}/appointments/${appointmentId}/check-in`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to check in patient');
    return res.json();
}

// Confirm Appointment
export const confirmAppointment = async (appointmentId: string) => {
    const res = await fetch(`${API_URL}/appointments/${appointmentId}/confirm`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to confirm appointment');
    return res.json();
}

// Cancel Appointment
export const cancelAppointment = async (appointmentId: string) => {
    const res = await fetch(`${API_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to cancel appointment');
    return res.json();
}

// Complete Appointment
export const completeAppointment = async (appointmentId: string) => {
    const res = await fetch(`${API_URL}/appointments/${appointmentId}/complete`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to complete appointment');
    return res.json();
}

// Get Pending Bills
export const getPendingBills = async (page = 1, limit = 10) => {
    const res = await fetch(`${API_URL}/bills/pending?page=${page}&limit=${limit}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch bills');
    return res.json();
}

// Get Invoices (Paid Bills)
export const getInvoices = async (page = 1, limit = 10) => {
    const res = await fetch(`${API_URL}/bills/invoices?page=${page}&limit=${limit}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
}

// Process Payment
export const processPayment = async (billId: string, paymentMethod: string) => {
    const res = await fetch(`${API_URL}/bills/${billId}/pay`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ paymentMethod })
    });
    if (!res.ok) throw new Error('Failed to process payment');
    return res.json();
}
