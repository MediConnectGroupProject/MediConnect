import { PrescriptionScanner } from './PrescriptionScanner';
import { InventoryView } from './InventoryView';

export default function PharmacistDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-xl px-2 font-bold text-gray-800">Pharmacy Operations</h1>
         <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PrescriptionScanner />
        <InventoryView />
      </div>
    </div>
  );
}