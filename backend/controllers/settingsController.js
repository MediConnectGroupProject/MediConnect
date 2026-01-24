import prisma from '../config/connection.js';
import { logAction } from '../utils/auditUtils.js';

// Get System Settings (Public or Protected? Usually protected, but some info needed for Landing Page)
// We might need two endpoints: one public (Hospital Name, Maintenance Mode), one private (All settings)
const getSettings = async (req, res) => {
    try {
        // Fetch the first (and only) settings record
        let settings = await prisma.systemSettings.findFirst();

        // If no settings exist yet, create default
        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    hospitalName: 'MediConnect Hospital',
                    supportEmail: 'support@mediconnect.com'
                }
            });
        }

        res.status(200).json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ message: "Failed to fetch system settings" });
    }
};

// Update Settings (Admin Only)
const updateSettings = async (req, res) => {
    try {
        const { 
            hospitalName, 
            supportEmail, 
            maintenanceMode, 
            registrationEnabled,
            emailNotifications,
            smsAlerts,
            autoBackup,
            enforceStrongPassword
        } = req.body;

        // Fetch existing to get ID
        const existing = await prisma.systemSettings.findFirst();

        let updated;
        if (existing) {
            updated = await prisma.systemSettings.update({
                where: { id: existing.id },
                data: {
                    hospitalName,
                    supportEmail,
                    maintenanceMode,
                    registrationEnabled,
                    emailNotifications, // Ensure we handle booleans correctly
                    smsAlerts,
                    autoBackup,
                    enforceStrongPassword
                }
            });
        } else {
            // Should rarely happen if getSettings is called first, but good for safety
            updated = await prisma.systemSettings.create({
                data: {
                    hospitalName,
                    supportEmail,
                    maintenanceMode,
                    registrationEnabled,
                    emailNotifications,
                    smsAlerts,
                    autoBackup,
                    enforceStrongPassword
                }
            });
        }

        res.status(200).json(updated);

        // Audit Log
        await logAction({
            userId: req.user.id,
            action: 'UPDATE_SYSTEM_SETTINGS',
            details: `Updated system settings (Hospital: ${hospitalName}, Maint: ${maintenanceMode})`,
            req
        });

    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ message: "Failed to update system settings" });
    }
};

// Public Access (For Landing Page / Login Checks)
// Returns only non-sensitive info
const getPublicSettings = async (req, res) => {
    try {
        let settings = await prisma.systemSettings.findFirst();
        
        if (!settings) {
            // Return defaults if DB empty
            return res.status(200).json({
                hospitalName: 'MediConnect Hospital',
                supportEmail: 'support@mediconnect.com',
                maintenanceMode: false,
                registrationEnabled: true
            });
        }

        res.status(200).json({
            hospitalName: settings.hospitalName,
            supportEmail: settings.supportEmail,
            maintenanceMode: settings.maintenanceMode,
            registrationEnabled: settings.registrationEnabled
        });
    } catch (error) {
         console.error("Error fetching public settings:", error);
         res.status(500).json({ message: "Error loading configuration" });
    }
}

export {
    getSettings,
    updateSettings,
    getPublicSettings
};
