const API_URL = `${import.meta.env.VITE_API_URL}/users`;

export const getProfile = async () => {
    const res = await fetch(`${API_URL}/me`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
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
