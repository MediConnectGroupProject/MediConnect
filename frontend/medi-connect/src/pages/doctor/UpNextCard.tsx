import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getUpNextAppointment, updateAppointmentStatus } from '../../api/doctorApi';
import type { Appointment } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Clock, PlayCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { ActiveConsultationCard } from './ActiveConsultationCard';

export function UpNextCard() {
  const navigate = useNavigate();
  const [activeAppt, setActiveAppt] = useState<Appointment | null>(null);
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    try {
        const data = await getUpNextAppointment();
        if (data) {
            const mapped: Appointment = {
                id: data.appointmentId,
                patientName: `${data.patient.user.firstName} ${data.patient.user.lastName}`,
                patientId: data.patientId,
                date: data.date,
                time: new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: data.status,
                reason: "Regular Consultation",
                doctorId: data.doctorId,
                doctorName: ""
            };

            if (mapped.status === 'IN_PROGRESS') {
                setActiveAppt(mapped);
                setNextAppt(null); 
            } else {
                setActiveAppt(null);
                setNextAppt(mapped);
            }
        } else {
            setActiveAppt(null);
            setNextAppt(null);
        }
    } catch (e) {
        console.error(e);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000); 
    return () => clearInterval(interval);
  }, []);

  // Use the new component for Active state
  if (activeAppt) {
      return (
          <ActiveConsultationCard 
            appointment={activeAppt} 
            onConsultationComplete={fetchAppointments} 
          />
      );
  }

  if (!nextAppt) return null;

  return (
    <Card className="mb-6 border-l-4 border-l-green-600 bg-white shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                    <User className="h-8 w-8 text-gray-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
            </div>
            
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">UP NEXT</Badge>
                    <span className="flex items-center text-sm text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {nextAppt.time}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{nextAppt.patientName}</h3>
                <p className="text-gray-600">{nextAppt.reason || 'Regular Consultation'}</p>
            </div>
        </div>

        <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 shadow-sm"
            onClick={async () => {
                try {
                     await updateAppointmentStatus(nextAppt.id, 'IN_PROGRESS');
                     toast.success('Consultation Started');
                     fetchAppointments();
                } catch(e) { toast.error('Failed to start'); }
            }}
        >
            <PlayCircle className="h-5 w-5 mr-2" />
            Start Consultation
        </Button>

      </CardContent>

    </Card>
  );
}
