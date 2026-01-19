const API_URL = `${import.meta.env.VITE_API_URL}/pharmacist`;

// Get Prescription Queue
export const getPrescriptionQueue = async () => {
    const res = await fetch(`${API_URL}/prescriptions`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch prescription queue');
    return res.json();
}

// Update Prescription Status
export const updatePrescriptionStatus = async (prescriptionId: string, status: string) => {
    const res = await fetch(`${API_URL}/prescriptions/${prescriptionId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update prescription status');
    return res.json();
}

// Get Inventory
export const getInventory = async () => {
    const res = await fetch(`${API_URL}/inventory`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
}
