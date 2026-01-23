import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { updateAppointmentStatus } from '../../api/doctorApi';
import type { Appointment } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Clock, PlayCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { ActiveConsultationCard } from './ActiveConsultationCard';

interface UpNextCardProps {
    activeAppointment: Appointment | null;
    nextAppointment: Appointment | null;
    onRefresh: () => void;
}

export function UpNextCard({ activeAppointment, nextAppointment, onRefresh }: UpNextCardProps) {

  // Use the new component for Active state
  if (activeAppointment) {
      return (
          <ActiveConsultationCard 
            appointment={activeAppointment} 
            onConsultationComplete={onRefresh} 
          />
      );
  }

  if (!nextAppointment) return null;

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
                        {nextAppointment.time}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{nextAppointment.patientName}</h3>
                <p className="text-gray-600">{nextAppointment.reason || 'Regular Consultation'}</p>
            </div>
        </div>

        <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 shadow-sm"
            onClick={async () => {
                try {
                     await updateAppointmentStatus(nextAppointment.id, 'IN_PROGRESS');
                     // Set start time for timer
                     localStorage.setItem(`consultation_start_${nextAppointment.id}`, Date.now().toString());
                     
                     toast.success('Consultation Started');
                     onRefresh();
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

