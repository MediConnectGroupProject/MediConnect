import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Activity, Users, FileText, Clock } from 'lucide-react';
import { MockApi } from '../../services/mockApi';

export function DoctorStats() {
  const [stats, setStats] = useState({
    appointments: 0,
    patientsSeen: 0,
    pendingLabs: 0
  });

  useEffect(() => {
    const loadStats = async () => {
        // In a real app, these would come from real API endpoints
        // Simulating some calculations based on available mock data
        const appts = await MockApi.getDoctorAppointments('u1');
        const labs = await MockApi.getLabRequests();
        
        setStats({
            appointments: appts.length,
            patientsSeen: appts.filter(a => a.status === 'COMPLETED').length,
            pendingLabs: labs.filter(l => l.status === 'PENDING').length
        });
    };
    loadStats();
  }, []);

  const statItems = [
    { 
      label: "Today's Appointments", 
      value: stats.appointments, 
      icon: Clock, 
      color: "text-blue-600",
      bg: "bg-blue-100" 
    },
    { 
      label: "Patients Seen", 
      value: stats.patientsSeen, 
      icon: Users, 
      color: "text-green-600", 
      bg: "bg-green-100" 
    },
    { 
      label: "Pending Lab Reports", 
      value: stats.pendingLabs, 
      icon: FileText, 
      color: "text-orange-600", 
      bg: "bg-orange-100" 
    },
    { 
      label: "Total Prescriptions", 
      value: "12", // Mock value for now
      icon: Activity, 
      color: "text-purple-600", 
      bg: "bg-purple-100" 
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, idx) => (
        <Card key={idx}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <h3 className="text-2xl font-bold mt-1">{item.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
