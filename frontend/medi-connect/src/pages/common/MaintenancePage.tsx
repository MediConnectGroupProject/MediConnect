import React from 'react';
import { Settings, Clock, Mail } from 'lucide-react';
import { useSystemSettings } from '../../context/SystemSettingsContext';

export default function MaintenancePage() {
  const { settings } = useSystemSettings();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Icon Animation */}
        <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
            <div className="relative bg-white p-4 rounded-full border-2 border-blue-50 shadow-sm flex items-center justify-center h-full w-full">
                <Settings className="h-10 w-10 text-blue-600 animate-spin-slow" />
            </div>
        </div>

        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">System Under Maintenance</h1>
            <p className="text-gray-500 text-lg">
                {settings.hospitalName || 'Our System'} is currently undergoing scheduled maintenance to improve your experience.
            </p>
        </div>

        <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-center gap-2 text-blue-800 font-medium mb-1">
                <Clock className="h-4 w-4" />
                <span>Estimated Time</span>
            </div>
            <p className="text-blue-600">Please check back shortly</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400 mb-2">Need urgent assistance?</p>
            <a href={`mailto:${settings.supportEmail}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
                <Mail className="h-4 w-4" />
                {settings.supportEmail}
            </a>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-400">
        &copy; {new Date().getFullYear()} {settings.hospitalName}
      </div>
    </div>
  );
}
