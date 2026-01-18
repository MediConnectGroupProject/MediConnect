const API_URL = `${import.meta.env.VITE_API_URL}`


export const logout = async () => {

    const res = await fetch(
        `${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {

        throw new Error(data?.message || "Logout failed");
    }

    return data;

}