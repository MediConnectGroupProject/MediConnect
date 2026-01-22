import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import logo from '../../assets/logo-mediconnect.png';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';

interface PrescriptionData {
    prescriptionId: string;
    issuedAt: string;
    notes: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    appointment?: {
        doctor: {
            user: {
                firstName: string;
                lastName: string;
            }
        }
    };
    prescriptionItems: Array<{
        medicineName: string;
        dosage: string;
        duration: string;
        instructions: string;
    }>;
}

export default function PrescriptionSlip() {
    const { id } = useParams();
    const [data, setData] = useState<PrescriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPrescription = async () => {
             try {
                 // Using fetch directly as this is a public route and our axios instance usually relies on auth/tokens
                 // or we can use axios but handle errors.
                 // Assuming API runs on same host/port in dev (via proxy) or we need full URL.
                 // In Vite dev, '/api' is proxied.
                 const res = await fetch(`/api/doctor/prescriptions/${id}/public`);
                 if (!res.ok) throw new Error("Prescription not found");
                 const json = await res.json();
                 setData(json);
             } catch (err) {
                 setError("Invalid or Expired Prescription");
             } finally {
                 setLoading(false);
             }
        };
        fetchPrescription();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading Prescription...</div>;
    if (error || !data) return <div className="flex justify-center items-center h-screen text-red-500 font-bold">{error}</div>;

    const doctorName = data.appointment?.doctor.user ? `Dr. ${data.appointment.doctor.user.firstName} ${data.appointment.doctor.user.lastName}` : 'MediConnect Doctor';

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-start">
            <Card className="w-full max-w-2xl shadow-lg print:shadow-none print:w-full">
                <CardHeader className="text-center border-b pb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                         <div className="flex items-center gap-2">
                            <img src={logo} alt="MediConnect" className="h-12 w-auto" />
                         </div>
                         <div className="text-center md:text-right text-xs text-gray-500">
                             <p>Prescription ID: {data.prescriptionId.substring(0,8).toUpperCase()}</p>
                             <p>{new Date(data.issuedAt).toLocaleDateString()} {new Date(data.issuedAt).toLocaleTimeString()}</p>
                         </div>
                    </div>
                    <CardTitle className="text-2xl font-serif text-blue-900">Digital Prescription</CardTitle>
                    <CardDescription>Official Medical Record</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 font-serif">
                    
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Doctor</h3>
                            <p className="font-medium text-lg">{doctorName}</p>
                            <p className="text-sm text-gray-600">General Medicine</p>
                        </div>
                        <div className="text-center md:text-right">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Patient</h3>
                            <p className="font-medium text-lg">{data.user.firstName} {data.user.lastName}</p>
                            <p className="text-sm text-gray-600">{data.user.email}</p>
                            <p className="text-sm text-gray-600">{data.user.phone || 'N/A'}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Rx Symbol */}
                    <div className="text-4xl font-bold text-gray-800 italic text-center md:text-left">Rx</div>

                    {/* Meds Table */}
                    <div className="border rounded-lg overflow-hidden overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold text-gray-700">Medicine</th>
                                    <th className="px-4 py-3 text-left font-bold text-gray-700">Dosage</th>
                                    <th className="px-4 py-3 text-left font-bold text-gray-700">Duration</th>
                                    <th className="px-4 py-3 text-left font-bold text-gray-700">Instructions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.prescriptionItems.map((item, idx) => (
                                    <tr key={idx} className="bg-white">
                                        <td className="px-4 py-3 font-medium">{item.medicineName}</td>
                                        <td className="px-4 py-3">{item.dosage}</td>
                                        <td className="px-4 py-3">{item.duration ? `${new Date(item.duration).toLocaleDateString()} (End)` : '5 Days'}</td>
                                        <td className="px-4 py-3 text-gray-600">{item.instructions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Notes */}
                    {data.notes && (
                        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                             <h4 className="text-sm font-bold text-yellow-800 mb-1">Clinical Notes:</h4>
                             <p className="text-sm text-gray-700">{data.notes}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-8 mt-8 border-t flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                        <div className="text-xs text-gray-400 text-center md:text-left">
                            <p>Generated by MediConnect System</p>
                            <p>This is a valid digital e-prescription.</p>
                        </div>
                        <div className="text-center">
                             {/* Signature Placeholder */}
                             <div className="h-12 w-32 mb-2 border-b border-gray-400 mx-auto md:mx-0"></div>
                             <p className="text-xs font-bold text-gray-600">Doctor's Signature</p>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
