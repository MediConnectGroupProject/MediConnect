import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Clock, StopCircle, User } from 'lucide-react';
import { updateAppointmentStatus } from '../../api/doctorApi';
import type { Appointment } from '../../types';
import toast from 'react-hot-toast';

interface ActiveConsultationCardProps {
    appointment: Appointment;
    onConsultationComplete: () => void;
}

export function ActiveConsultationCard({ appointment, onConsultationComplete }: ActiveConsultationCardProps) {
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndConsultation = async () => {
        try {
            await updateAppointmentStatus(appointment.id, 'COMPLETED');
            toast.success('Consultation Completed');
            onConsultationComplete();
        } catch (e) {
            toast.error('Failed to end consultation');
        }
    };

    return (
        <Card className="mb-6 border-l-4 border-l-blue-600 bg-blue-50/50 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                            <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 h-4 w-4 rounded-full border-2 border-white animate-pulse"></div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-600 hover:bg-blue-700 animate-pulse">IN PROGRESS</Badge>
                            <span className="flex items-center text-lg font-mono font-bold text-blue-700">
                                <Clock className="h-4 w-4 mr-2" />
                                {formatTime(timer)}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{appointment.patientName}</h3>
                        <p className="text-gray-600">{appointment.reason}</p>
                    </div>
                </div>

                <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleEndConsultation}
                >
                    <StopCircle className="h-5 w-5 mr-2" />
                    End Consultation
                </Button>

            </CardContent>
        </Card>
    );
}
