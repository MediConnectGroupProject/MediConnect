import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { MockApi } from '../../services/mockApi';
import type { Prescription } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

export function PrescriptionForm() {
  const [patientId, setPatientId] = useState('');
  const [items, setItems] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [generatedPrescription, setGeneratedPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock creation
      const prescription = await MockApi.createPrescription({
        patientId: patientId || 'u2', // Default to Jane for demo
        doctorId: 'u1',
        doctorName: 'Dr. John Doe',
        appointmentId: 'a_dummy', // Dummy appointment ID for direct prescription
        date: new Date().toISOString().split('T')[0],
        items: items.map((i, idx) => ({ ...i, medicationId: `m${idx}` }))
      });
      setGeneratedPrescription(prescription);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Issue E-Prescription</CardTitle>
      </CardHeader>
      <CardContent>
        {!generatedPrescription ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Patient ID</Label>
              <Input 
                placeholder="Enter Patient ID (e.g. u2)" 
                value={patientId} 
                onChange={e => setPatientId(e.target.value)} 
              />
            </div>

            <div className="space-y-4">
              <Label>Medications</Label>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end border p-2 rounded bg-gray-50">
                  <div className="col-span-4">
                     <p className="text-xs mb-1">Drug Name</p>
                     <Input placeholder="Paracetamol" value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} required />
                  </div>
                  <div className="col-span-3">
                     <p className="text-xs mb-1">Dosage</p>
                     <Input placeholder="500mg" value={item.dosage} onChange={e => updateItem(index, 'dosage', e.target.value)} />
                  </div>
                  <div className="col-span-4">
                     <p className="text-xs mb-1">Instruction</p>
                     <Input placeholder="1-0-1 after food" value={item.frequency} onChange={e => updateItem(index, 'frequency', e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Medication
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Prescription & QR'}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-bold text-green-800">Prescription Created!</h3>
            <div className="bg-white p-4 rounded shadow-sm">
                <QRCodeSVG value={generatedPrescription.qrCodeData} size={200} />
            </div>
            <p className="text-sm text-center text-gray-600">
              Scan this QR code at the Pharmacy to retrieve prescription details.
            </p>
            <div className="w-full">
               <h4 className="font-semibold mb-2">Details:</h4>
               <ul className="list-disc list-inside text-sm">
                 {generatedPrescription.items.map((i, idx) => (
                   <li key={idx}>{i.name} - {i.dosage} ({i.frequency})</li>
                 ))}
               </ul>
            </div>
            <Button variant="outline" onClick={() => { setGeneratedPrescription(null); setItems([{ name: '', dosage: '', frequency: '', duration: '' }]); }}>
              Issue Another
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
