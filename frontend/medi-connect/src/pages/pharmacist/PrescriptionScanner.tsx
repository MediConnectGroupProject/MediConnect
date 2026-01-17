import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { MockApi } from '../../services/mockApi';
import type { Prescription } from '../../types';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export function PrescriptionScanner() {
  const [scanId, setScanId] = useState('');
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPrescription(null);
    setLoading(true);

    try {
      const result = await MockApi.getPrescriptionById(scanId);
      if (result) {
        setPrescription(result);
      } else {
        setError('Prescription not found. Please check the ID.');
      }
    } catch (err) {
      setError('Error scanning prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    if (!prescription) return;
    setLoading(true);
    try {
      const updated = await MockApi.dispensePrescription(prescription.id);
      setPrescription(updated);
    } catch (err) {
      setError('Failed to dispense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Prescription Scanner</CardTitle>
        <CardDescription>Enter Prescription ID or Scan QR Code content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            placeholder="e.g. p171..." 
            value={scanId} 
            onChange={e => setScanId(e.target.value)} 
            required
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {prescription && (
          <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="font-bold text-lg">Rx #{prescription.id}</h3>
                 <p className="text-sm text-gray-500">Dr. {prescription.doctorName}</p>
                 <p className="text-xs text-gray-400">{prescription.date}</p>
               </div>
               <Badge variant={prescription.status === 'DISPENSED' ? 'secondary' : 'default'} className={prescription.status === 'ISSUED' ? 'bg-blue-600' : 'bg-green-600'}>
                 {prescription.status}
               </Badge>
             </div>
             
             <div className="py-2">
               <h4 className="font-medium text-sm mb-1">Medications:</h4>
               <ul className="list-disc list-inside text-sm text-gray-700">
                 {prescription.items.map((item, i) => (
                   <li key={i}>{item.name} - {item.dosage} ({item.frequency})</li>
                 ))}
               </ul>
             </div>

             {prescription.status === 'ISSUED' ? (
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleDispense} disabled={loading}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Mark as Dispensed
                </Button>
             ) : (
                <div className="text-center text-green-700 font-medium py-2 border-t border-green-200 bg-green-50 rounded">
                  Already Dispensed
                </div>
             )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
