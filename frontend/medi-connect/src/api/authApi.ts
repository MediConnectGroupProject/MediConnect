const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export const loginUser = async (email: string, password: string, selectedRole?: string) => {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, selectedRole })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
}

export const registerUser = async (userData: any) => {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
}

export const logoutUser = async () => {
    const res = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Logout failed');
    return data;
}

export const getMe = async () => {
    const res = await fetch(`${API_URL}/me`, {
         headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
     const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
    return data;
}
