import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";


export default function DoctorDashboard() {

  //     case 'doctor':
  //       return {
  //         title: 'Doctor Dashboard',
  //         cards: [
  //           {
  //             title: "Today's Appointments",
  //             value: '8',
  //             description: 'Next: 10:30 AM - John Doe',
  //             icon: Calendar,
  //             action: () => onNavigate('doctor')
  //           },
  //           {
  //             title: 'Patient Queue',
  //             value: '3',
  //             description: 'Real-time updates',
  //             icon: Users,
  //             action: () => onNavigate('doctor')
  //           },
  //           {
  //             title: 'Prescriptions to Review',
  //             value: '5',
  //             description: '2 urgent requests',
  //             icon: FileText,
  //             action: () => onNavigate('doctor')
  //           },
  //           {
  //             title: 'New Patient Requests',
  //             value: '12',
  //             description: 'Pending acceptance',
  //             icon: PlusCircle,
  //             action: () => onNavigate('doctor')
  //           }
  //         ]
  //       };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* {cards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={card.action}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            );
          })} */}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* {user.role === 'patient' && (
                <>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => onNavigate('bookAppointment')}>
                    <Calendar className="h-5 w-5" />
                    Book Appointment
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => onNavigate('viewPrescriptions')}>
                    <FileText className="h-5 w-5" />
                    View Prescriptions
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => onNavigate('healthRecords')}>
                    <Activity className="h-5 w-5" />
                    Health Records
                  </Button>
                </>
              )}
              
              {user.role === 'doctor' && (
                <>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Calendar className="h-5 w-5" />
                    Manage Schedule
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Users className="h-5 w-5" />
                    Patient Queue
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FileText className="h-5 w-5" />
                    Create Prescription
                  </Button>
                </>
              )}
              
              {user.role === 'pharmacist' && (
                <>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FileText className="h-5 w-5" />
                    Process Prescriptions
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Activity className="h-5 w-5" />
                    Inventory Management
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Point of Sale
                  </Button>
                </>
              )}
              
              {user.role === 'admin' && (
                <>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Activity className="h-5 w-5" />
                    System Settings
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FileText className="h-5 w-5" />
                    Reports
                  </Button>
                </>
              )}
              
              {user.role === 'receptionist' && (
                <>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Calendar className="h-5 w-5" />
                    Manage Appointments
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <DollarSign className="h-5 w-5" />
                    Process Payments
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Receipt className="h-5 w-5" />
                    Generate Invoices
                  </Button>
                </>
              )}
              
              {user.role === 'mlt' && (
                <>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <TestTube className="h-5 w-5" />
                    Update Reports
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Mark Ready
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <DollarSign className="h-5 w-5" />
                    Accept Payments
                  </Button>
                </>
              )} */}
          </div>
        </CardContent>
      </Card>
    </>
  );
}