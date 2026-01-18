const API_URL = `${import.meta.env.VITE_API_URL}/mlt`;

// Get Lab Report Queue
export const getLabReportQueue = async () => {
    const res = await fetch(`${API_URL}/reports`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch lab report queue');
    return res.json();
}

// Update Lab Report (Status, Results, Comments)
export const updateLabReport = async (reportId: string, data: { status?: string, resultData?: string, comments?: string }) => {
    const res = await fetch(`${API_URL}/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update lab report');
    return res.json();
}
