const API_URL = `${import.meta.env.VITE_API_URL}/pharmacist`;

export const getAlerts = async () => {
    const res = await fetch(`${API_URL}/inventory/alerts?threshold=50&days=90`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch inventory alerts');
    return res.json();
};


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

// Get Dashboard Stats
// Inventory & POS


export const processSale = async (saleData: any) => {
    const res = await fetch(`${API_URL}/sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(saleData)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Sale failed');
    }
    return res.json();
};

export const getDashboardStats = async () => {
    const res = await fetch(`${API_URL}/stats`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
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




// get inventory
export const getInventory = async (page: number, limit: number, search: string, popular: boolean = false) => {
    
    const urlParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    if (popular) {
        urlParams.append('popular', 'true');
    }

    if (search) {
        urlParams.append('search', encodeURIComponent(search));
    }
    
    // @ts-ignore
    if (search === '' && page === 1 && limit === 1000) {
         // Dirty hack to detect initial load if we don't change the signature everywhere
         // Better: check a specific flag or optional arg
    }
    // Actually, I should just modify the signature or use a config object. 
    // For now, I'll assume if caller passes specific flag


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

