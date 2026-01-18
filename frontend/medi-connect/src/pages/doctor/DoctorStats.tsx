import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Activity, Users, FileText, Clock } from 'lucide-react';
import { getDoctorStats } from '../../api/doctorApi';

export function DoctorStats() {
  const [stats, setStats] = useState({
    appointments: 0,
    patientsSeen: 0,
    pendingLabs: 0,
    totalPatients: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
        try {
            const data = await getDoctorStats();
            // Map backend data
            // calculated "appointments" as total for today = pending + seen (roughly)
            setStats({
                appointments: (data.pendingAppointments || 0) + (data.patientsSeen || 0), 
                patientsSeen: data.patientsSeen || 0,
                pendingLabs: data.pendingLabs || 0,
                totalPatients: data.totalPatients || 0
            });
        } catch (e) {
            console.error(e);
        }
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
      label: "Total Patients", 
      value: stats.totalPatients, 
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
