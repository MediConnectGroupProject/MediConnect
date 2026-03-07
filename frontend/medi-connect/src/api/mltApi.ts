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

// Get Completed Lab Reports
export const getCompletedLabReports = async () => {
    const res = await fetch(`${API_URL}/reports/completed`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch completed lab reports');
    return res.json();
}

// Update Lab Report (Status, Results, Comments)
export const updateLabReport = async (reportId: string, data: { status?: string, results?: string, notes?: string }) => {
    const res = await fetch(`${API_URL}/reports/${reportId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update lab report');
    return res.json();
}
