const API_URL = `${import.meta.env.VITE_API_URL}`

// get user count
export const getUserCount = async () => {

    const res = await fetch(
        `${API_URL}/users/count`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }
    );

    const data = await res.json();

    if (!res.ok) {

        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

// get all users
export const getAllUsers = async (page : number, limit : number ,search : string) => {

    const urlParams = new URLSearchParams({

        page: String(page),
        limit: String(limit),
    });

    if (search) {
        urlParams.append('search', encodeURIComponent(search));
    }

    const res = await fetch(
        `${API_URL}/users?${urlParams.toString()}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        }
    );

    const data = await res.json();

    if (!res.ok) {

        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

// get all roles
export const getAllRoles = async () => { 

    const res = await fetch(
        `${API_URL}/roles`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        }
    );

    const data = await res.json();

    if (!res.ok) {

        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// change role status
export const changeRoleStatus = async (roleId: number,userId: string , status: string) => {

    const res = await fetch(
        `${API_URL}/roles/user/${userId}/role/${roleId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                status: status,
            })
        }
    );

    const data = await res.json();

    if (!res.ok) {
        
        throw new Error(data.message ||"Update role status failed");
    }

    return data;
};

// add role
export const addRole = async (roleName: string,userId: string) => {
    
    const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            roleName: roleName
        })
    });

    const data = await res.json();

    if (!res.ok) {
        
        throw new Error(data.message ||"Add role failed");
    }

    return data;
};

// change user status
export const changeUserStatus = async (userId: string, status: string) => {
    
    const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ status :status })
    });

    const data = await res.json();

    if (!res.ok) {

        throw new Error(data.message || "Something went wrong!");
    }

    return data;
}