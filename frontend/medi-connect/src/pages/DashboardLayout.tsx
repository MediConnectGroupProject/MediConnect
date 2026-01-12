import React from 'react';
import { Outlet } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Users, Activity, FileText, PlusCircle, Bell, TestTube, DollarSign, Receipt, CheckCircle } from 'lucide-react';

import { useAuth } from '../utils/authContext';

export function DashboardLayout() {
  // const getDashboardContent = () => {
  //   switch (user.role) {
  //     case 'patient':
  //       return {
  //         title: 'Patient Dashboard',
  //         cards: [
  //           {
  //             title: 'Upcoming Appointments',
  //             value: '2',
  //             description: 'Next: Tomorrow 2:00 PM',
  //             icon: Calendar,
  //             action: () => onNavigate('patient')
  //           },
  //           {
  //             title: 'Active Prescriptions',
  //             value: '3',
  //             description: '1 ready for pickup',
  //             icon: FileText,
  //             action: () => onNavigate('patient')
  //           },
  //           {
  //             title: 'Health Records',
  //             value: '15',
  //             description: 'Recent test results available',
  //             icon: Activity,
  //             action: () => onNavigate('patient')
  //           },
  //           {
  //             title: 'Messages',
  //             value: '2',
  //             description: 'New notifications',
  //             icon: Bell,
  //             action: () => onNavigate('patient')
  //           }
  //         ]
  //       };

  //     case 'pharmacist':
  //       return {
  //         title: 'Pharmacist Dashboard',
  //         cards: [
  //           {
  //             title: 'Prescription Requests',
  //             value: '15',
  //             description: '7 pending verification',
  //             icon: FileText,
  //             action: () => onNavigate('pharmacist')
  //           },
  //           {
  //             title: 'Low Stock Alerts',
  //             value: '8',
  //             description: 'Medications need reorder',
  //             icon: Bell,
  //             action: () => onNavigate('pharmacist')
  //           },
  //           {
  //             title: 'Ready for Pickup',
  //             value: '23',
  //             description: 'Customer notifications sent',
  //             icon: Users,
  //             action: () => onNavigate('pharmacist')
  //           },
  //           {
  //             title: "Today's Sales",
  //             value: '$2,340',
  //             description: '↑ 12% from yesterday',
  //             icon: Activity,
  //             action: () => onNavigate('pharmacist')
  //           }
  //         ]
  //       };
  //     case 'admin':
  //       return {
  //         title: 'Admin Dashboard',
  //         cards: [
  //           {
  //             title: 'Total Users',
  //             value: '1,248',
  //             description: '↑ 23 new this week',
  //             icon: Users,
  //             action: () => onNavigate('admin')
  //           },
  //           {
  //             title: 'System Health',
  //             value: '99.9%',
  //             description: 'All services operational',
  //             icon: Activity,
  //             action: () => onNavigate('admin')
  //           },
  //           {
  //             title: 'Pending Approvals',
  //             value: '7',
  //             description: 'New doctor registrations',
  //             icon: FileText,
  //             action: () => onNavigate('admin')
  //           },
  //           {
  //             title: 'Security Alerts',
  //             value: '0',
  //             description: 'No active threats',
  //             icon: Bell,
  //             action: () => onNavigate('admin')
  //           }
  //         ]
  //       };
  //     case 'receptionist':
  //       return {
  //         title: 'Receptionist Dashboard',
  //         cards: [
  //           {
  //             title: "Today's Appointments",
  //             value: '15',
  //             description: '5 pending confirmation',
  //             icon: Calendar,
  //             action: () => onNavigate('receptionist')
  //           },
  //           {
  //             title: 'Payment Queue',
  //             value: '8',
  //             description: '$1,250 pending',
  //             icon: DollarSign,
  //             action: () => onNavigate('receptionist')
  //           },
  //           {
  //             title: 'Invoices Generated',
  //             value: '23',
  //             description: 'This week',
  //             icon: Receipt,
  //             action: () => onNavigate('receptionist')
  //           },
  //           {
  //             title: 'Active Patients',
  //             value: '12',
  //             description: 'Currently checked in',
  //             icon: Users,
  //             action: () => onNavigate('receptionist')
  //           }
  //         ]
  //       };
  //     case 'mlt':
  //       return {
  //         title: 'MLT Dashboard',
  //         cards: [
  //           {
  //             title: 'Pending Reports',
  //             value: '9',
  //             description: '3 urgent priority',
  //             icon: TestTube,
  //             action: () => onNavigate('mlt')
  //           },
  //           {
  //             title: 'Ready Reports',
  //             value: '6',
  //             description: 'Awaiting confirmation',
  //             icon: CheckCircle,
  //             action: () => onNavigate('mlt')
  //           },
  //           {
  //             title: 'Payment Queue',
  //             value: '4',
  //             description: '$580 pending',
  //             icon: DollarSign,
  //             action: () => onNavigate('mlt')
  //           },
  //           {
  //             title: 'Invoices This Week',
  //             value: '18',
  //             description: '↑ 15% from last week',
  //             icon: Receipt,
  //             action: () => onNavigate('mlt')
  //           }
  //         ]
  //       };
  //     default:
  //       return { title: 'Dashboard', cards: [] };
  //   }
  // };

  // const { title, cards } = getDashboardContent();

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Welcome back, { user?.name }!</h1>
            <p className="text-gray-600"></p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="capitalize">
              
            </Badge>
            <Button 
              variant="outline"
              className="font-bold"
            >
              Go to Portal
            </Button>
          </div>
        </div>

        <Outlet />
        
      </div>
    </div>
  );
}