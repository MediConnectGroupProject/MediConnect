import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { createPrescription } from '../../api/doctorApi';
import type { Appointment, Prescription } from '../../types';
import { Plus, Trash2, User } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';

interface PrescriptionFormProps {
    activeAppointment?: Appointment | null;
}

export function PrescriptionForm({ activeAppointment }: PrescriptionFormProps) {

  const [patientId, setPatientId] = useState('');
  const [items, setItems] = useState([{ name: '', dosage: '', frequency: '', timing: 'After Food', duration: '', tabletCount: '', instructions: '' }]);
  const [extraInstructions, setExtraInstructions] = useState('');

  // Auto-fill active patient (with safety check for re-renders)
  const [lastAutoFilledId, setLastAutoFilledId] = useState<string | null>(null);

  if (activeAppointment && activeAppointment.patientId !== lastAutoFilledId) {
      setPatientId(activeAppointment.patientId);
      setLastAutoFilledId(activeAppointment.patientId);
  }

  const [generatedPrescription, setGeneratedPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { name: '', dosage: '', frequency: '', timing: 'After Food', duration: '', tabletCount: '', instructions: '' }]);
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
      // REAL API CALL
      const prescription = await createPrescription({
        patientId: patientId || 'u2', // Should essentially select from a list or search
        appointmentId: activeAppointment?.id || null, // Link to current visit if active
        items: items, // backend controller handles mapping
        notes: extraInstructions
      });

      // Add QR Code Data (URL to public slip)
      if (!prescription.qrCodeData) {
          prescription.qrCodeData = `${window.location.origin}/prescription/${prescription.prescriptionId}`;
      }
      
      setGeneratedPrescription(prescription);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="col-span-1 h-fit sticky top-6">
      <CardHeader>
        <CardTitle>Issue E-Prescription</CardTitle>
      </CardHeader>
      <CardContent>
        {!generatedPrescription ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Auto-detected Patient Banner */}
            {activeAppointment ? (
                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-900">Active Patient</p>
                        <p className="text-xs text-blue-700 font-bold">{activeAppointment.patientName}</p>
                    </div>
                    <input type="hidden" value={patientId} />
                </div>
            ) : (
                <div className="space-y-2">
                <Label>Patient ID</Label>
                <Input 
                    placeholder="Enter Patient ID (e.g. u2)" 
                    value={patientId} 
                    onChange={e => setPatientId(e.target.value)} 
                />
                </div>
            )}


            <div className="space-y-4">
              <Label>Medications</Label>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start border p-2 rounded bg-gray-50">
                  <div className="col-span-12 md:col-span-4">
                     <p className="text-xs mb-1">Drug Name</p>
                     <Input placeholder="Paracetamol" value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} required />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                     <p className="text-xs mb-1">Dosage</p>
                     <Input 
                        placeholder="500" 
                        value={item.dosage} 
                        onChange={e => updateItem(index, 'dosage', e.target.value)}
                        onBlur={e => {
                            const val = e.target.value;
                            if(val && /^\d+$/.test(val)) {
                                updateItem(index, 'dosage', val + 'mg');
                            }
                        }}
                     />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                     <p className="text-xs mb-1">Qty</p>
                     <Input 
                        placeholder="e.g. 10" 
                        value={(item as any).tabletCount || ''} 
                        onChange={e => updateItem(index, 'tabletCount', e.target.value)} 
                     />
                  </div>
                  <div className="col-span-10 md:col-span-3">
                     <p className="text-xs mb-1">Duration</p>
                     <Input placeholder="e.g. 5 days" value={item.duration} onChange={e => updateItem(index, 'duration', e.target.value)} />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex flex-col justify-end pb-0.5">
                    <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="col-span-12 flex flex-col md:flex-row gap-4 mt-2">
                      <div className="w-full md:w-1/3">
                         <p className="text-xs mb-1">Timing</p>
                         <Select value={(item as any).timing} onValueChange={val => updateItem(index, 'timing', val)}>
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="After Food">After Food</SelectItem>
                                <SelectItem value="Before Food">Before Food</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="w-full md:w-2/3">
                         <p className="text-xs mb-1">Extra Instructions (Optional)</p>
                         <Input 
                            placeholder="e.g. Take with warm water" 
                            className="w-full"
                            value={(item as any).instructions || ''} 
                            onChange={e => updateItem(index, 'instructions', e.target.value)} 
                         />
                      </div>
                  </div>
                </div>

              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Medication
              </Button>
            </div>

            <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                    placeholder="General notes for the prescription..." 
                    value={extraInstructions}
                    onChange={e => setExtraInstructions(e.target.value)}
                />
            </div>


            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
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
                 {generatedPrescription.prescriptionItems.map((i, idx) => (
                   <li key={idx}>{i.medicineName || i.name} - {i.dosage} ({i.instructions || 'No instructions'})</li>
                 ))}
               </ul>
               {(generatedPrescription as any).notes && (
                   <div className="mt-2 pt-2 border-t">
                       <p className="text-xs font-semibold">Notes:</p>
                       <p className="text-sm italic">{(generatedPrescription as any).notes}</p>
                   </div>
               )}
            </div>
            <Button variant="outline" onClick={() => { setGeneratedPrescription(null); setItems([{ name: '', dosage: '', frequency: '', timing: 'After Food', duration: '', tabletCount: '', instructions: '' }]); setExtraInstructions(''); }}>

              Issue Another
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
