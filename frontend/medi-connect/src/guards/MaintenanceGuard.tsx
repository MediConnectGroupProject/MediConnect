import React from 'react';
import { useSystemSettings } from '../context/SystemSettingsContext';
import MaintenancePage from '../pages/common/MaintenancePage';
import { useAuth } from '../utils/authContext';

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSystemSettings();
  const { user } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Or a nice spinner
  }

  // If maintenance is ON 
  // AND user is NOT logged in or NOT an Admin (Admins might bypass if they are already logged in)
  
  if (settings.maintenanceMode) {
      // If user is logged in as ADMIN, let them pass
      if (user && user.roles.some((r: { name: string }) => r.name === 'ADMIN')) {
          return <>{children}</>;
      }
      
      // Otherwise, block
      return <MaintenancePage />;
  }

  return <>{children}</>;
}
