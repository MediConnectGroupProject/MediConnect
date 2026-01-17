
import { LabRequests } from './LabRequests';

export default function MLTDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-xl px-2 font-bold text-gray-800">Laboratory Management</h1>
         <span className="text-sm text-gray-500">Today: {new Date().toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <LabRequests />
        {/* Placeholder for future expansion like Inventory or Reports */}
      </div>
    </div>
  );
}
