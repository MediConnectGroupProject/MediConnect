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


// export const getInventory = async () => {
//     const res = await fetch(
//         `${API_URL}/inventory`, {
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         credentials: 'include'
//     });
    
//     if (!res.ok) throw new Error('Failed to fetch inventory');
//     return res.json();
// }

// get inventory
export const getInventory = async (page: number, limit: number, search: string) => {
    
    const urlParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    if (search) {
        urlParams.append('search', encodeURIComponent(search));
    }

    const res = await fetch(
        `${API_URL}/inventory?${urlParams.toString()}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {

        throw new Error(data?.message || 'Failed to fetch inventory');
    }

    return data;
}

