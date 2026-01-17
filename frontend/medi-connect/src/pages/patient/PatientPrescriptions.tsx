import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {QRCodeSVG} from 'qrcode.react';
import { MockApi } from '../../services/mockApi';
import type { Prescription } from '../../types';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Pill, QrCode } from 'lucide-react';

export function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await MockApi.getPatientPrescriptions('u2'); // Hardcoded 
        setPrescriptions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading) return <div>Loading records...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Prescriptions</CardTitle>
        <CardDescription>View your medication history and QR codes for pharmacy.</CardDescription>
      </CardHeader>
      <CardContent>
        {prescriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Pill className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No prescriptions on record.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prescriptions.map((p) => (
              <Card key={p.id} className="border bg-slate-50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                     <div>
                       <CardTitle className="text-base font-semibold">{p.date}</CardTitle>
                       <CardDescription className="text-xs">{p.doctorName}</CardDescription>
                     </div>
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button variant="ghost" size="icon" title="Show QR">
                           <QrCode className="h-5 w-5 text-blue-600" />
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md">
                         <DialogHeader>
                           <DialogTitle>Prescription QR Code</DialogTitle>
                         </DialogHeader>
                         <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
                           <QRCodeSVG value={p.qrCodeData} size={250} />
                           <p className="mt-4 text-sm text-gray-500 text-center">Show this to the pharmacist to dispense your medication.</p>
                         </div>
                       </DialogContent>
                     </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 mt-2">
                    {p.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between border-b pb-1 last:border-0">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500">{item.dosage}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                     <span>Status: {p.status}</span>
                     <span>Permissions: View Only</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
