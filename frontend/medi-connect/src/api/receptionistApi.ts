const API_URL = `${import.meta.env.VITE_API_URL}/receptionist`;

// Get Today's Appointments
export const getDailyAppointments = async () => {
    const res = await fetch(`${API_URL}/appointments/today`, {
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

// Get Pending Bills
export const getPendingBills = async () => {
    const res = await fetch(`${API_URL}/bills/pending`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch bills');
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
