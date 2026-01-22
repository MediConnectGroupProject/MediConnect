import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { createPrescription } from '../../api/doctorApi';

interface NewPrescriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    patients: any[];
    initialPatientId?: string;
}

interface MedicationItem {
    id: string;
    name: string;
    dosage: string;
    freq: string; 
    timing: string;
    duration: string;
    qty: string; 
    instructions: string;
}

export function NewPrescriptionDialog({ open, onOpenChange, onSuccess, patients, initialPatientId }: NewPrescriptionDialogProps) {
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [medications, setMedications] = useState<MedicationItem[]>([{
        id: '1', name: '', dosage: '', freq: '', timing: 'After Food', duration: '', qty: '', instructions: ''
    }]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdId, setCreatedId] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setCreatedId(null);
            setMedications([{ id: '1', name: '', dosage: '', freq: '', timing: 'After Food', duration: '', qty: '', instructions: '' }]);
            setNotes('');
            setSelectedPatientId(initialPatientId || '');
        }
    }, [open, initialPatientId]);

    const addMedication = () => {
        setMedications([...medications, {
            id: Math.random().toString(36).substr(2, 9),
            name: '', dosage: '', freq: '', timing: 'After Food', duration: '', qty: '', instructions: ''
        }]);
    };

    const removeMedication = (id: string) => {
        if (medications.length > 1) {
            setMedications(medications.filter(m => m.id !== id));
        }
    };

    const updateMedication = (id: string, field: keyof MedicationItem, value: string) => {
        setMedications(medications.map(m => 
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    const handleSubmit = async () => {
        if (!selectedPatientId) {
            toast.error("Please select a patient");
            return;
        }
        if (medications.some(m => !m.name)) {
            toast.error("Please enter medicine names");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                patientId: selectedPatientId,
                notes,
                items: medications.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    duration: m.duration, 
                    instructions: m.instructions,
                    frequency: m.qty ? `Qty: ${m.qty}` : '',
                    timing: m.timing
                }))
            };

            const res = await createPrescription(payload);
            toast.success("Prescription created!");
            setCreatedId(res.prescriptionId); 
            onSuccess();
        } catch (e) {
            console.error(e);
            toast.error("Failed to create prescription");
        } finally {
            setLoading(false);
        }
    };

    if (createdId) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Prescription Created</DialogTitle>
                        <DialogDescription>
                            Scan this QR code to view the prescription.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="bg-white p-4 border rounded-lg shadow-sm">
                            <QRCodeSVG value={`${window.location.origin}/prescription/${createdId}`} size={192} />
                        </div>
                        <p className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">{createdId}</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>New Prescription</DialogTitle>
                    <DialogDescription>Create a digital prescription for a patient.</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {/* Patient Selection */}
                    <div className="space-y-2">
                        <Label>Select Patient</Label>
                        <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Search patient..." />
                            </SelectTrigger>
                            <SelectContent>
                                {patients.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id}> 
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Medications List */}
                    <div className="space-y-4">
                        <Label>Medications</Label>
                        {medications.map((item) => (
                           <div key={item.id} className="grid grid-cols-12 gap-2 items-start border p-2 rounded bg-gray-50">
                              <div className="col-span-12 md:col-span-4">
                                 <p className="text-xs mb-1 font-medium text-gray-500">Drug Name</p>
                                 <Input placeholder="Paracetamol" value={item.name} onChange={e => updateMedication(item.id, 'name', e.target.value)} />
                              </div>
                              <div className="col-span-6 md:col-span-2">
                                 <p className="text-xs mb-1 font-medium text-gray-500">Dosage</p>
                                 <Input placeholder="500mg" value={item.dosage} onChange={e => updateMedication(item.id, 'dosage', e.target.value)} />
                              </div>
                              <div className="col-span-6 md:col-span-2">
                                 <p className="text-xs mb-1 font-medium text-gray-500">Qty</p>
                                 <Input placeholder="e.g. 10" value={item.qty} onChange={e => updateMedication(item.id, 'qty', e.target.value)} />
                              </div>
                              <div className="col-span-10 md:col-span-3">
                                 <p className="text-xs mb-1 font-medium text-gray-500">Duration</p>
                                 <Input placeholder="e.g. 5 days" value={item.duration} onChange={e => updateMedication(item.id, 'duration', e.target.value)} />
                              </div>
                              <div className="col-span-2 md:col-span-1 flex flex-col justify-end pb-0.5">
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 h-10 w-10" onClick={() => removeMedication(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="col-span-12 flex flex-col md:flex-row gap-4 mt-1">
                                  <div className="w-full md:w-1/3">
                                     <p className="text-xs mb-1 font-medium text-gray-500">Timing</p>
                                     <Select value={item.timing} onValueChange={val => updateMedication(item.id, 'timing', val)}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="After Food">After Food</SelectItem>
                                            <SelectItem value="Before Food">Before Food</SelectItem>
                                            <SelectItem value="With Food">With Food</SelectItem>
                                        </SelectContent>
                                     </Select>
                                  </div>
                                  <div className="w-full md:w-2/3">
                                     <p className="text-xs mb-1 font-medium text-gray-500">Extra Instructions (Optional)</p>
                                     <Input placeholder="e.g. Take with warm water" value={item.instructions} onChange={e => updateMedication(item.id, 'instructions', e.target.value)} />
                                  </div>
                              </div>
                           </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addMedication} className="w-full border-dashed">
                            <Plus className="h-4 w-4 mr-2" /> Add Medication
                        </Button>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Clinical Notes</Label>
                        <Textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)}
                            placeholder="General notes for the prescription..."
                            className="min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        {loading ? 'Generating...' : 'Generate Prescription & QR'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
