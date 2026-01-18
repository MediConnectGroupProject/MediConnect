import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MockApi } from '../../services/mockApi';
import type { Appointment } from '../../types';
import { Clock, PlayCircle, User } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../../utils/RouteNames';

export function UpNextCard() {
  const navigate = useNavigate();
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);


  useEffect(() => {
    const fetchNext = async () => {
        const appts = await MockApi.getDoctorAppointments('u1');
        // Find first confirmed/pending appt
        const upcoming = appts.find(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
        if (upcoming) setNextAppt(upcoming);
    };
    fetchNext();
  }, []);

  if (!nextAppt) return null;

  return (
    <Card className="mb-6 border-l-4 border-l-blue-600 bg-blue-50/50">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                    <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
            </div>
            
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-blue-600 hover:bg-blue-700">UP NEXT</Badge>
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
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            onClick={() => {
                navigate(RouteNames.DOCTOR_PORTAL, { state: { tab: 'prescriptions', patientId: nextAppt.patientId } });
            }}
        >
            <PlayCircle className="h-5 w-5 mr-2" />
            Start Consultation
        </Button>

      </CardContent>

    </Card>
  );
}
