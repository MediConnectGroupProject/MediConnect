const API_URL = `${import.meta.env.VITE_API_URL}/users`;

export const getProfile = async () => {
    const res = await fetch(`${API_URL}/me`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("DEBUG: Profile Error Data:", errorData);
        throw new Error(errorData.message || 'Failed to fetch profile');
    }
    return res.json();
}

export const updateProfile = async (data: any) => {
    const res = await fetch(`${API_URL}/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
}

export const changePassword = async (passwordData: any) => {
    const res = await fetch(`${API_URL}/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordData)
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change password');
    return data;
}
