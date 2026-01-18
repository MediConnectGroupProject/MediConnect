import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar, Search, QrCode, Home, LogOut, CheckCircle, Undo, Plus, Clock } from 'lucide-react';
import { Separator } from '../../components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../../utils/RouteNames';
import { useAuth } from '../../utils/authContext';
import { UserProfile } from '../../components/UserProfile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";

import { useLocation } from 'react-router-dom';

export default function DoctorPortal() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const handleDashboardNavigation = () => {
     navigate(`${RouteNames.DASHBOARD}/doctor`);
  };

  const [activeTab, setActiveTab] = useState('schedule');

  useEffect(() => {
    if (location.state && (location.state as any).tab) {
        setActiveTab((location.state as any).tab);
    }
  }, [location]);


  const [todaysSchedule, setTodaysSchedule] = useState([
    { id: 1, patient: 'John Smith', time: '9:00 AM', type: 'Consultation', status: 'upcoming', duration: '30 min' },
    { id: 2, patient: 'Mary Johnson', time: '9:30 AM', type: 'Follow-up', status: 'in_progress', duration: '15 min' },
    { id: 3, patient: 'Robert Davis', time: '10:00 AM', type: 'Check-up', status: 'upcoming', duration: '30 min' },
    { id: 4, patient: 'Sarah Wilson', time: '10:30 AM', type: 'Consultation', status: 'upcoming', duration: '45 min' },
    { id: 5, patient: 'Michael Brown', time: '11:15 AM', type: 'Emergency', status: 'urgent', duration: '30 min' }
  ]);

  // Add Appointment State
  const [isAddApptOpen, setIsAddApptOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({ patient: '', time: '', type: 'Consultation', duration: '30 min' });

  const handleAddAppointment = () => {
      const id = Math.max(...todaysSchedule.map(s => s.id)) + 1;
      setTodaysSchedule([...todaysSchedule, { ...newAppt, id, status: 'upcoming' }]);
      setIsAddApptOpen(false);
      setNewAppt({ patient: '', time: '', type: 'Consultation', duration: '30 min' });
  };

  // Manage Availability State
  const [availability, setAvailability] = useState({
      start: '09:00',
      end: '17:00',
      days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false }
  });

  const patientQueue = [
    { id: 1, patient: 'Mary Johnson', checkInTime: '9:25 AM', waitTime: '5 min', room: 'Room 3', status: 'waiting' },
    { id: 2, patient: 'Robert Davis', checkInTime: '9:50 AM', waitTime: '10 min', room: 'Room 1', status: 'ready' },
    { id: 3, patient: 'Sarah Wilson', checkInTime: '10:20 AM', waitTime: '15 min', room: 'Waiting Area', status: 'checked_in' }
  ];

  const prescriptionRequests = [
    { id: 1, patient: 'John Smith', medication: 'Lisinopril 10mg', reason: 'Hypertension management', status: 'pending', date: '2024-01-15' },
    { id: 2, patient: 'Mary Johnson', medication: 'Amoxicillin 500mg', reason: 'Upper respiratory infection', status: 'pending', date: '2024-01-15' },
    { id: 3, patient: 'Robert Davis', medication: 'Metformin 500mg', reason: 'Diabetes management', status: 'approved', date: '2024-01-14' }
  ];

  const patientHistory = [
    { id: 1, name: 'John Smith', lastVisit: '2024-01-10', condition: 'Hypertension', age: 45, phone: '(555) 123-4567' },
    { id: 2, name: 'Mary Johnson', lastVisit: '2024-01-08', condition: 'Respiratory infection', age: 32, phone: '(555) 234-5678' },
    { id: 3, name: 'Robert Davis', lastVisit: '2024-01-05', condition: 'Type 2 Diabetes', age: 58, phone: '(555) 345-6789' }
  ];

  const reports = [
    { id: 1, title: 'Monthly Patient Statistics', period: 'December 2023', generated: '2024-01-01', type: 'monthly' },
    { id: 2, title: 'Treatment Outcomes Report', period: 'Q4 2023', generated: '2024-01-02', type: 'quarterly' },
    { id: 3, title: 'Daily Summary Report', period: 'January 14, 2024', generated: '2024-01-15', type: 'daily' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleDashboardNavigation}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>


            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-semibold">Doctor Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Dr. Abc Def</span>
            <Badge variant="secondary">Doctor</Badge>
            <Button variant="ghost" size="sm" onClick={() => {
              logout();
              navigate(RouteNames.LOGIN);
            }}>
              <LogOut className="h-4 w-4" />
            </Button>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="queue">Patient Queue</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Today's Schedule</h2>
              <div className="flex gap-2">
                {/* Manage Availability Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Manage Availability
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manage Availability</DialogTitle>
                            <DialogDescription>Set your standard working hours for the week.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input type="time" value={availability.start} onChange={e => setAvailability({...availability, start: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Input type="time" value={availability.end} onChange={e => setAvailability({...availability, end: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Working Days</Label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(availability.days).map(([day, active]) => (
                                        <div key={day} 
                                             className={`px-3 py-1 rounded-full border cursor-pointer text-sm ${active ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                                             onClick={() => setAvailability({...availability, days: {...availability.days, [day]: !active}})}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Add Appointment Dialog */}
                <Dialog open={isAddApptOpen} onOpenChange={setIsAddApptOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Add Appointment</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Appointment</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Patient Name</Label>
                                <Input value={newAppt.patient} onChange={e => setNewAppt({...newAppt, patient: e.target.value})} placeholder="e.g. John Doe" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} placeholder="e.g. 10:00 AM" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Duration</Label>
                                    <Input value={newAppt.duration} onChange={e => setNewAppt({...newAppt, duration: e.target.value})} placeholder="e.g. 30 min" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Input value={newAppt.type} onChange={e => setNewAppt({...newAppt, type: e.target.value})} placeholder="e.g. Consultation" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddAppointment}>Schedule Appointment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Appointments - January 15, 2024</CardTitle>
                <CardDescription>Your scheduled appointments for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysSchedule.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center w-20">
                          <p className="font-medium">{appointment.time}</p>
                          <p className="text-xs text-gray-500">{appointment.duration}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{appointment.patient}</h3>
                            <Badge variant={
                              appointment.status === 'urgent' ? 'destructive' :
                              appointment.status === 'in_progress' ? 'default' : 
                              appointment.status === 'completed' ? 'secondary' : 'outline'
                            }>
                              {appointment.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Button variant="ghost" size="sm" onClick={() => navigate('.', { state: { tab: 'patients', patientId: 'u'+appointment.id } })}>View Profile</Button> 
                        
                        {/* Status Actions */}
                        {appointment.status === 'upcoming' || appointment.status === 'urgent' ? (
                             <Button size="sm" onClick={() => {
                                const updated = todaysSchedule.map(app => 
                                    app.id === appointment.id ? { ...app, status: 'in_progress' } : app
                                );
                                setTodaysSchedule(updated);
                             }}>Start Consultation</Button>
                        ) : null}

                        {appointment.status === 'in_progress' && (
                            <>
                                <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                    onClick={() => {
                                        const updated = todaysSchedule.map(app => 
                                            app.id === appointment.id ? { ...app, status: 'upcoming' } : app
                                        );
                                        setTodaysSchedule(updated);
                                    }}
                                    title="Undo Start"
                                >
                                    <Undo className="h-4 w-4" />
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                        const updated = todaysSchedule.map(app => 
                                            app.id === appointment.id ? { ...app, status: 'completed' } : app
                                        );
                                        setTodaysSchedule(updated);
                                    }}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" /> Complete
                                </Button>
                            </>
                        )}
                        
                         {appointment.status === 'completed' && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" /> Done
                            </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Queue Tab */}
          <TabsContent value="queue" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Patient Queue</h2>
              <div className="text-sm text-gray-600">Real-time updates</div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Queue</CardTitle>
                <CardDescription>Patients waiting to be seen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientQueue.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-medium">{patient.checkInTime}</p>
                          <p className="text-sm text-red-500">Wait: {patient.waitTime}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{patient.patient}</h3>
                            <Badge variant={
                              patient.status === 'ready' ? 'default' :
                              patient.status === 'waiting' ? 'destructive' : 'secondary'
                            }>
                              {patient.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{patient.room}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Send Message</Button>
                        <Button size="sm">Call Patient</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Prescriptions</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  Create e-Prescription (QR)
                </Button>
                <Button>New Prescription</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Prescription Requests</CardTitle>
                <CardDescription>Review and approve prescription requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptionRequests.map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{prescription.patient}</h3>
                          <Badge variant={prescription.status === 'pending' ? 'destructive' : 'secondary'}>
                            {prescription.status}
                          </Badge>
                        </div>
                        <p className="font-medium text-blue-600">{prescription.medication}</p>
                        <p className="text-sm text-gray-600">{prescription.reason}</p>
                        <p className="text-sm text-gray-500">Requested: {prescription.date}</p>
                      </div>
                      <div className="flex gap-2">
                        {prescription.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm">Decline</Button>
                            <Button size="sm">Approve</Button>
                          </>
                        )}
                        {prescription.status === 'approved' && (
                          <Button variant="outline" size="sm">View Details</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Patient Management</h2>
              <Button onClick={() => {
                  const newPatientId = Math.random().toString(36).substring(7); // temp ID
                  navigate('.', { replace: true, state: { tab: 'patients', patientId: newPatientId } });
              }}>Add Patient</Button>
            </div>

            {(location.state as any)?.patientId ? (
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600">Active Viewing</Badge>
                            <span className="font-medium text-blue-900">Dr. is currently viewing patient ID: {(location.state as any).patientId}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('.', { replace: true, state: { ...location.state, patientId: undefined } })}>Clear View</Button>
                    </div>
                    {/* Use the new UserProfile Component */}
                    <UserProfile userId={(location.state as any).patientId} readOnly={true} /> 
                </div>
            ) : (


            <Card>
              <CardHeader>
                <CardTitle>Patient History</CardTitle>
                <CardDescription>View and manage patient records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientHistory.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{patient.name}</h3>
                          <Badge variant="outline">Age {patient.age}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{patient.condition}</p>
                        <p className="text-sm text-gray-500">Last visit: {patient.lastVisit} • {patient.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Medical History</Button>
                        <Button size="sm">Schedule Appointment</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Calendar Management</h2>
              <div className="flex gap-2">
                <Button variant="outline">Day View</Button>
                <Button variant="outline">Week View</Button>
                <Button>Month View</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Availability Management</CardTitle>
                <CardDescription>Set your working hours and availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-7 gap-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center">
                      <div className="font-medium mb-2">{day}</div>
                      <div className="space-y-2">
                        <div className="p-2 bg-blue-100 rounded text-sm">9:00-12:00</div>
                        <div className="p-2 bg-blue-100 rounded text-sm">14:00-17:00</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline">Set Vacation</Button>
                  <Button variant="outline">Block Time</Button>
                  <Button>Update Schedule</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Reports</h2>
              <Button>Generate New Report</Button>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Reports</CardTitle>
                  <CardDescription>Patient statistics and treatment summaries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{report.title}</h3>
                          <p className="text-sm text-gray-600">Period: {report.period}</p>
                          <p className="text-sm text-gray-500">Generated: {report.generated}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Download PDF</Button>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>This month's overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">128</div>
                      <div className="text-sm text-gray-600">Patients Seen</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-sm text-gray-600">Show Rate</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">45</div>
                      <div className="text-sm text-gray-600">Prescriptions</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">4.8</div>
                      <div className="text-sm text-gray-600">Avg Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}