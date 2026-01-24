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
export const getAllUsers = async (page: number, limit: number, search: string, type?: 'internal' | 'external') => {

    const urlParams = new URLSearchParams({

        page: String(page),
        limit: String(limit),
    });

    if (search) {
        urlParams.append('search', encodeURIComponent(search));
    }
    
    if (type) {
        urlParams.append('type', type);
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
export const changeRoleStatus = async (roleId: number, userId: string, status: string) => {

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

        throw new Error(data.message || "Update role status failed");
    }

    return data;
};

// add role
export const addRole = async (roleName: string, userId: string) => {

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

        throw new Error(data.message || "Add role failed");
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
        body: JSON.stringify({ status: status })
    });

    const data = await res.json();

    if (!res.ok) {

        throw new Error(data.message || "Something went wrong!");
    }


    return data;
}

// get dashboard stats
export const getAdminDashboardStats = async () => {
    const res = await fetch(`${API_URL}/stats`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
}

// get system health
export const getSystemHealth = async () => {
    const res = await fetch(`${API_URL}/health`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
}

// get system report
export const getSystemReport = async (type: 'users' | 'logs') => {
    const res = await fetch(`${API_URL}/reports?type=${type}`, {
        method: 'GET',
        headers: { 
            // Don't set Content-Type for download unless needed, but we expect blob/text
        },
        credentials: 'include'
    });
    
    if (!res.ok) throw new Error('Failed to download report');

    // Return blob for file download
    if (type === 'users') return res.blob();
    // Return json for logs
    // Return json for logs
    return res.json();
}

// create user
export const createUser = async (userData: any) => {
    const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create user");
    return data;
}

// delete user
export const deleteUser = async (userId: string) => {
    const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to delete user");
    }

    return data;
}

// remove role
export const removeRole = async (roleId: number, userId: string) => {
    const res = await fetch(`${API_URL}/roles/user/${userId}/role/${roleId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Remove role failed");
    }

    return data;
}

// get single user details
export const getUserDetails = async (userId: string) => {
    const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch user details");
    }

    return data;
}

// get audit logs
export const getAuditLogs = async (page: number, limit: number) => {
    const res = await fetch(`${API_URL}/logs?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch audit logs");
    }

    return data;
}

// revoke staff sessions
export const revokeStaffSessions = async () => {
    const res = await fetch(`${API_URL}/revoke-sessions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to revoke sessions");
    }

    return data;
}

// get active staff
export const getActiveStaff = async () => {
    const res = await fetch(`${API_URL}/active-staff`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch active staff");
    }

    return data;
}