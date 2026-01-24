import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of our settings
interface SystemSettings {
    hospitalName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    enforceStrongPassword?: boolean;
}

// Default settings in case fetch fails
const defaultSettings: SystemSettings = {
    hospitalName: 'MediConnect Hospital',
    supportEmail: 'support@mediconnect.com',
    maintenanceMode: false,
    registrationEnabled: true,
    enforceStrongPassword: false
};

interface SystemSettingsContextType {
    settings: SystemSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SystemSettingsContext = createContext<SystemSettingsContextType>({
    settings: defaultSettings,
    loading: true,
    refreshSettings: async () => {}
});

export const useSystemSettings = () => useContext(SystemSettingsContext);

export const SystemSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    const API_URL = `${import.meta.env.VITE_API_URL}`;

    const fetchSettings = async () => {
        try {
            // We use the public endpoint so this works even if not logged in
            const res = await fetch(`${API_URL}/settings/public`, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to load system settings:", error);
            // Keep defaults
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SystemSettingsContext.Provider value={{
            settings,
            loading,
            refreshSettings: fetchSettings
        }}>
            {children}
        </SystemSettingsContext.Provider>
    );
};
