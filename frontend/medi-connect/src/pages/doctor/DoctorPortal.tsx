import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar, CheckCircle, Undo, Plus, QrCode, Trash, Search, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../../components/UserProfile';
import { QRCodeSVG } from 'qrcode.react';
import { DoctorCalendar } from './DoctorCalendar';
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
import { NewPrescriptionDialog } from './NewPrescriptionDialog';

export default function DoctorPortal() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('schedule');

  useEffect(() => {
    if (location.state && (location.state as any).tab) {
        setActiveTab((location.state as any).tab);
    }
  }, [location]);


  const [todaysSchedule, setTodaysSchedule] = useState<any[]>([]);
  const [patientQueue, setPatientQueue] = useState<any[]>([]);
  const [prescriptionRequests, setPrescriptionRequests] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredPatients = useMemo(() => {
      if (!patientSearchQuery) return patientsList;
      const lower = patientSearchQuery.toLowerCase();
      return patientsList.filter((p: any) => 
          (p.name && p.name.toLowerCase().includes(lower)) || 
          (p.phone && p.phone.includes(lower))
      );
  }, [patientsList, patientSearchQuery]);

  const hasActiveConsultation = useMemo(() => todaysSchedule.some(a => a.status === 'in_progress'), [todaysSchedule]);

  const loadPortalData = async () => {
        try {
            const api = await import('../../api/doctorApi');
            const data = await api.getDoctorPortalData(selectedDate);
            
            // Map Schedule
            const schedule = data.schedule.map((apt: any) => ({
                id: apt.appointmentId,
                patientId: apt.patientId, 
                patient: apt.patient?.user ? `${apt.patient.user.firstName} ${apt.patient.user.lastName}` : 'Unknown',
                time: new Date(apt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: apt.status.toLowerCase(),
                type: 'Consultation', 
            }));
            setTodaysSchedule(schedule);

            // Map Queue
            const queue = data.schedule.filter((apt: any) => apt.status === 'PENDING' || apt.status === 'IN_PROGRESS').map((apt: any) => {
                return {
                    id: apt.appointmentId,
                    patient: apt.patient?.user ? `${apt.patient.user.firstName} ${apt.patient.user.lastName}` : 'Unknown',
                    checkInTime: new Date(apt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: apt.status.toLowerCase(),
                    room: 'Room 1' 
                };
            });
            setPatientQueue(queue);

            const requests = await api.getPrescriptionRequests();
            setPrescriptionRequests(requests); 
            
            // Fetch Availability
            try {
                const availData = await api.getAvailability();
                if (availData && availData.workingHours) {
                     if ('days' in availData.workingHours) {
                         const old = availData.workingHours as any;
                         const newHours: any = {};
                         ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(d => {
                             newHours[d] = { start: old.start, end: old.end, active: !!old.days[d] };
                         });
                         setWorkingHours(newHours);
                     } else {
                         setWorkingHours(availData.workingHours);
                     }
                } else {
                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const initial: any = {};
                    days.forEach(d => {
                        initial[d] = { start: '09:00', end: '17:00', active: ['Mon','Tue','Wed','Thu','Fri'].includes(d) };
                    });
                    setWorkingHours(initial);
                }
            } catch(e) { console.error("Failed to fetch availability"); } 

            // Fetch Patients
            try {
                const patients = await api.getPatients();
                setPatientsList(patients);
            } catch (e) { console.error("Failed to fetch patients"); }

        } catch (error) {
            console.error("Failed to fetch portal data", error);
        }
    };

  useEffect(() => {
    loadPortalData();
  }, [selectedDate]);

  // Add Appointment State
  const [isAddApptOpen, setIsAddApptOpen] = useState(false);
  const [activeApptTab, setActiveApptTab] = useState("existing");
  const [newAppt, setNewAppt] = useState({ patientId: '', date: '', time: '', type: 'Consultation' });
  const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', dob: '', gender: 'MALE', phone: '' });
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
  const [preSelectedPatientId, setPreSelectedPatientId] = useState<string>('');
  const [viewQrId, setViewQrId] = useState<string | null>(null);

  const handleDeletePrescription = async (id: string) => {
      if(!window.confirm("Are you sure you want to delete this prescription?")) return;
      
      const toastId = toast.loading("Deleting...");
      try {
          const api = await import('../../api/doctorApi');
          await api.deletePrescription(id);
          toast.success("Deleted successfully", { id: toastId });
          loadPortalData();
      } catch (e) {
          toast.error("Failed to delete", { id: toastId });
      }
  };

  const handleAddAppointment = async () => {
      if (!newAppt.date || !newAppt.time) {
          toast.error('Please select both date and time');
          return;
      }

      if (activeApptTab === 'existing' && !newAppt.patientId) {
          toast.error('Please select a patient');
          return;
      }
      
      if (activeApptTab === 'new') {
           if (!newPatient.firstName || !newPatient.lastName || !newPatient.dob) {
               toast.error('Please fill in required patient details (Name, DOB)');
               return;
           }
      }
      
      const dateObj = new Date(newAppt.date);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = days[dateObj.getDay()];
      const dayConfig = workingHours[dayName];

      if (!dayConfig || !dayConfig.active) {
          toast.error(`Doctor is not available on ${dayName}s`);
          return;
      }

      if (newAppt.time < dayConfig.start || newAppt.time > dayConfig.end) {
          toast.error(`Time must be between ${dayConfig.start} and ${dayConfig.end}`);
          return;
      }

      const toastId = toast.loading('Scheduling appointment...');
      try {
          const api = await import('../../api/doctorApi');
          
          const payload: any = { ...newAppt };
          if (activeApptTab === 'new') {
              payload.newPatient = newPatient;
              delete payload.patientId;
          }

          await api.createAppointment(payload);
          
          toast.success('Appointment scheduled!', { id: toastId });
          setIsAddApptOpen(false);
          setNewAppt({ patientId: '', date: '', time: '', type: 'Consultation' });
          
          // Refresh Data
          loadPortalData();

      } catch (e) {
          console.error(e);
          toast.error('Failed to schedule appointment', { id: toastId });
      }
  };

  // Manage Availability State
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [workingHours, setWorkingHours] = useState<Record<string, { start: string; end: string; active: boolean }>>({});
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon']);

  // Helper to update working hours for selected days
  const updateSelectedDays = (updates: Partial<{ start: string; end: string; active: boolean }>) => {
      setWorkingHours(prev => {
          const next = { ...prev };
          selectedDays.forEach(day => {
              next[day] = { ...(next[day] || { start: '09:00', end: '17:00', active: false }), ...updates };
          });
          return next;
      });
  };





  // Reports Logic
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState({ type: 'daily_appointments', date: new Date().toISOString().split('T')[0] });
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);

  const handleGenerateReport = async () => {
       const toastId = toast.loading('Generating report...');
       try {
           const api = await import('../../api/doctorApi');
           let data = [];
           let filename = `report_${reportConfig.type}_${reportConfig.date}.csv`;
           
           if (reportConfig.type === 'daily_appointments') {
               const start = new Date(reportConfig.date);
               start.setHours(0,0,0,0);
               const end = new Date(reportConfig.date);
               end.setHours(23,59,59,999);
               
               // Fetch specific date
               data = await api.getAppointments(null, 'ALL', { start, end });
               
               // Convert to CSV
               const headers = ['ID,Time,Patient Name,Status,Type\n'];
               const rows = data.map((d: any) => 
                   `${d.appointmentId},${new Date(d.time).toLocaleTimeString()},"${d.patient?.user?.firstName} ${d.patient?.user?.lastName}",${d.status},Consultation`
               );
               
               const csvContent = headers + rows.join('\n');
               const blob = new Blob([csvContent], { type: 'text/csv' });
               const url = window.URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = filename;
               a.click();
           } else if (reportConfig.type === 'prescription_summary') {
               // Initial basic implementation for prescriptions
                const validRequests = prescriptionRequests; // In real app, filter by date
                const headers = ['ID,Date,Patient,Status,Items\n'];
                const rows = validRequests.map((p: any) => 
                    `${p.id},${new Date(p.issuedAt).toLocaleDateString()},"${p.patientName}",${p.status},"${p.prescriptionItems?.map((i:any)=>i.medicineName).join('|')}"`
                );
                const csvContent = headers + rows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report_prescriptions_${reportConfig.date}.csv`;
                a.click();
           }
           
            const newReport = {
                id: Date.now(),
                title: reportConfig.type === 'daily_appointments' ? 'Daily Appointments' : 'Prescription Summary',
                date: reportConfig.date,
                timestamp: new Date().toLocaleTimeString()
            };
            setGeneratedReports(prev => [newReport, ...prev]);

            toast.success('Report downloaded', { id: toastId });
            setIsReportDialogOpen(false);

       } catch (e) {
           console.error(e);
           toast.error('Failed to generate report', { id: toastId });
       }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}


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

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold">Daily Schedule</h2>
                  <div className="flex items-center gap-2 bg-white border rounded-md px-2 py-1 shadow-sm">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                          const d = new Date(selectedDate);
                          d.setDate(d.getDate() - 1);
                          setSelectedDate(d);
                      }}><ChevronLeft className="h-4 w-4" /></Button>
                      <span className="font-medium text-sm w-36 text-center">{selectedDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                          const d = new Date(selectedDate);
                          d.setDate(d.getDate() + 1);
                          setSelectedDate(d);
                      }}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>Today</Button>
              </div>
              <div className="flex gap-2">
                {/* Manage Availability Dialog */}
                <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Manage Availability
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manage Availability</DialogTitle>
                            <DialogDescription>Select days to edit, then set their working hours.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            {/* Days Selection */}
                            <div className="space-y-2">
                                <Label>Select Days to Edit</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                                        const isSelected = selectedDays.includes(day);
                                        const isActive = workingHours[day]?.active;
                                        return (
                                        <div key={day} 
                                             className={`px-3 py-1 rounded-full border cursor-pointer text-sm transition-colors
                                                ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}
                                                ${!isSelected && isActive ? 'ring-1 ring-blue-500 text-blue-700 bg-blue-50' : ''}
                                             `}
                                             onClick={() => {
                                                 if (isSelected) {
                                                     if (selectedDays.length > 1) setSelectedDays(selectedDays.filter(d => d !== day));
                                                 } else {
                                                     setSelectedDays([...selectedDays, day]);
                                                 }
                                             }}
                                        >
                                            {day} {isActive && !isSelected && <span className="text-xs ml-1">●</span>}
                                        </div>
                                    )})}
                                </div>
                            </div>

                            {/* Controls for Selected Days */}
                            <div className="grid gap-4 p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">Settings for {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''}</Label>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="active-mode">Available</Label>
                                        <Switch id="active-mode" 
                                            checked={selectedDays.some(d => workingHours[d]?.active)} 
                                            onCheckedChange={(checked) => updateSelectedDays({ active: checked })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Time</Label>
                                        <Input type="time" 
                                            value={workingHours[selectedDays[0]]?.start || '09:00'} 
                                            onChange={e => updateSelectedDays({ start: e.target.value })} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Time</Label>
                                        <Input type="time" 
                                            value={workingHours[selectedDays[0]]?.end || '17:00'} 
                                            onChange={e => updateSelectedDays({ end: e.target.value })} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={async () => {
                                const toastId = toast.loading('Updating availability...');
                                try {
                                    const api = await import('../../api/doctorApi');
                                    await api.updateAvailability({ availability: true, workingHours: workingHours });
                                    toast.success('Availability updated successfully', { id: toastId });
                                    setIsAvailabilityOpen(false);
                                } catch(e) { 
                                    console.error(e); 
                                    toast.error('Failed to update availability', { id: toastId });
                                }
                            }}>Save Changes</Button>
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
                            
                            <Tabs value={activeApptTab} onValueChange={setActiveApptTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="existing">Existing Patient</TabsTrigger>
                                    <TabsTrigger value="new">New Patient</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="existing" className="space-y-2">
                                    <Label>Select Patient</Label>
                                    <select 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newAppt.patientId}
                                        onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}
                                    >
                                        <option value="" disabled>Select a patient</option>
                                        {patientsList.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </TabsContent>
                                
                                <TabsContent value="new" className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label>First Name <span className="text-red-500">*</span></Label>
                                            <Input placeholder="First Name" value={newPatient.firstName} onChange={e => setNewPatient({...newPatient, firstName: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Last Name <span className="text-red-500">*</span></Label>
                                            <Input placeholder="Last Name" value={newPatient.lastName} onChange={e => setNewPatient({...newPatient, lastName: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label>Date of Birth <span className="text-red-500">*</span></Label>
                                            <Input type="date" value={newPatient.dob} onChange={e => setNewPatient({...newPatient, dob: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Gender</Label>
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={newPatient.gender}
                                                onChange={e => setNewPatient({...newPatient, gender: e.target.value})}
                                            >
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Phone (Optional)</Label>
                                        <Input placeholder="Phone Number" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} />
                                    </div>
                                </TabsContent>
                            </Tabs>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input type="time" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
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

            {/* Upcoming & Active Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Upcoming Appointments 
                    <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">{todaysSchedule.filter(a => a.status !== 'completed').length}</Badge>
                </CardTitle>
                <CardDescription>Scheduled for today - {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysSchedule.filter(a => a.status !== 'completed').length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No pending appointments</div>
                  ) : (
                    todaysSchedule.filter(a => a.status !== 'completed').map((appointment) => (
                        <div key={appointment.id} className={`flex items-center justify-between p-4 border rounded-lg ${appointment.status === 'in_progress' ? 'bg-blue-50 border-blue-200' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className="text-center w-20">
                            <p className="font-medium">{appointment.time}</p>
                            </div>
                            <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{appointment.patient}</h3>
                                <Badge variant={
                                appointment.status === 'urgent' ? 'destructive' :
                                appointment.status === 'in_progress' ? 'default' : 
                                'outline'
                                } className={appointment.status === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                                {appointment.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Button variant="ghost" size="sm" onClick={() => navigate('.', { state: { tab: 'patients', patientId: appointment.patientId } })}>View Profile</Button> 
                            
                            {/* Status Actions */}
                            {appointment.status === 'upcoming' || appointment.status === 'urgent' || appointment.status === 'pending' ? (
                                <Button size="sm" 
                                    disabled={hasActiveConsultation}
                                    title={hasActiveConsultation ? "Complete current consultation first" : "Start Consultation"}
                                    onClick={async () => {
                                    const toastId = toast.loading('Starting...');
                                    try {
                                        const api = await import('../../api/doctorApi');
                                        await api.updateAppointmentStatus(appointment.id, 'IN_PROGRESS');
                                        toast.success('Consultation started', { id: toastId });
                                        loadPortalData();
                                    } catch (e: any) {
                                        // Show backend error message if available
                                        toast.error(e.message || 'Failed to update status', { id: toastId });
                                    }
                                }}>Start Consultation</Button>
                            ) : null}

                            {appointment.status === 'in_progress' && (
                                <>
                                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                        onClick={async () => {
                                            const toastId = toast.loading('Updating...');
                                            try {
                                                const api = await import('../../api/doctorApi');
                                                await api.updateAppointmentStatus(appointment.id, 'PENDING');
                                                toast.success('Status reset', { id: toastId });
                                                loadPortalData();
                                            } catch (e) {
                                                toast.error('Failed to reset status', { id: toastId });
                                            }
                                        }}
                                        title="Undo Start"
                                    >
                                        <Undo className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700"
                                        onClick={async () => {
                                            const toastId = toast.loading('Completing...');
                                            try {
                                                const api = await import('../../api/doctorApi');
                                                await api.updateAppointmentStatus(appointment.id, 'COMPLETED');
                                                toast.success('Consultation completed', { id: toastId });
                                                loadPortalData();
                                            } catch (e) {
                                                toast.error('Failed to complete', { id: toastId });
                                            }
                                        }}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" /> Complete
                                    </Button>
                                </>
                            )}
                        </div>
                        </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Completed Appointments */}
            {todaysSchedule.some(a => a.status === 'completed') && (
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Completed 
                        <Badge variant="secondary" className="ml-2">{todaysSchedule.filter(a => a.status === 'completed').length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {todaysSchedule.filter(a => a.status === 'completed').map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 opacity-75">
                        <div className="flex items-center gap-4">
                            <div className="text-center w-20">
                            <p className="font-medium text-gray-500">{appointment.time}</p>
                            </div>
                            <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-700">{appointment.patient}</h3>
                                <Badge variant="secondary">COMPLETED</Badge>
                            </div>
                            <p className="text-sm text-gray-500">{appointment.type}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Button variant="ghost" size="sm" onClick={() => navigate('.', { state: { tab: 'patients', patientId: appointment.patientId } })}>View Profile</Button> 
                            <span className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" /> Done
                            </span>
                        </div>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>
            )}
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
                  {patientQueue.length === 0 ? (
                      <div className="text-center p-8 text-gray-500">Queue is empty</div>
                  ) : (
                    patientQueue.map((patient) => (
                        <div key={patient.id} className={`flex items-center justify-between p-4 border rounded-lg ${patient.status === 'in_progress' ? 'bg-blue-50 border-blue-200' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className="text-center w-24">
                            <p className="font-medium">{patient.checkInTime}</p>
                            </div>
                            <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{patient.patient}</h3>
                                <Badge variant={
                                patient.status === 'in_progress' ? 'default' : 'secondary'
                                } className={patient.status === 'in_progress' ? 'bg-blue-600' : ''}>
                                {patient.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{patient.room}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" 
                                disabled={patient.status === 'in_progress'}
                                onClick={() => alert(`Simulating sending message to ${patient.patient}... (This would trigger a push notification)`)}
                            >
                                Send Message
                            </Button>
                        </div>
                        </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Prescriptions</h2>
              <div className="flex gap-2">
                <Button onClick={() => setIsPrescriptionDialogOpen(true)}>New Prescription</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Prescription Records</CardTitle>
                <CardDescription>History of issued prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Patient</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-500">Action</th>
                            </tr>
                        </thead>
                         <tbody>
                            {prescriptionRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        No prescriptions found. Click "New Prescription" to create one.
                                    </td>
                                </tr>
                            ) : (
                                prescriptionRequests.map((p) => (
                                    <tr key={p.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono text-xs">{p.id?.substring(0,8).toUpperCase()}</td>
                                        <td className="px-4 py-3 font-medium">{p.patientName || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-gray-500">{new Date(p.issuedAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className={p.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}>
                                                {p.status === 'PENDING' ? 'ISSUED' : p.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                                             {p.prescriptionItems?.map((i:any) => i.medicineName).join(', ') || 'No Items'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => setViewQrId(p.id)} title="View QR">
                                                    <QrCode className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeletePrescription(p.id)} title="Delete" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                         </tbody>
                    </table>
                </div>
              </CardContent>
            </Card>

            {/* View QR Dialog */}
            <Dialog open={!!viewQrId} onOpenChange={(o) => !o && setViewQrId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Prescription QR Code</DialogTitle>
                        <DialogDescription>Scan to view prescription slip</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-6">
                        {viewQrId && (
                             <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <QRCodeSVG 
                                    value={`${window.location.protocol}//${window.location.hostname}:${window.location.port}/prescription/${viewQrId}`}
                                    size={200}
                                    level="H" 
                                />
                             </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Sort Patients Strategy */}
            {(() => {
                 const activeAppt = todaysSchedule.find(s => s.status === 'in_progress');
                 const upcomingAppts = todaysSchedule.filter(s => ['pending', 'upcoming', 'urgent'].includes(s.status));
                 
                 const activeId = activeAppt?.patientId;
                 const upcomingIds = upcomingAppts.map(a => a.patientId);
                 
                 const activeP = patientsList.find(p => p.id === activeId);
                 const upcomingPs = upcomingIds.map(id => patientsList.find(p => p.id === id))
                                               .filter(p => p && p.id !== activeId)
                                               // dedup
                                               .filter((p, index, self) => index === self.findIndex(t => t.id === p.id));
                 
                 const others = patientsList.filter(p => p.id !== activeId && !upcomingPs.find(up => up.id === p.id))
                                            .sort((a,b) => a.name.localeCompare(b.name));
                 
                 const sortedPatients = [
                     ...(activeP ? [{...activeP, name: `🔵 ${activeP.name} (Active)`}] : []),
                     ...upcomingPs.map(p => ({...p, name: `🕒 ${p.name} (Upcoming)`})),
                     ...others
                 ];

                 return (
                    <NewPrescriptionDialog 
                        open={isPrescriptionDialogOpen} 
                        initialPatientId={preSelectedPatientId}
                        onOpenChange={(open) => {
                            setIsPrescriptionDialogOpen(open);
                            if (!open) setPreSelectedPatientId('');
                        }}
                        patients={sortedPatients}
                        onSuccess={() => {
                            loadPortalData();
                        }}
                    />
                 );
            })()}

          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Patient Management</h2>
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
             <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                        placeholder="Search patients by name or phone..." 
                        className="pl-8 max-w-sm"
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                    />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>All Patients</CardTitle>
                    <CardDescription>Directory of all registered patients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Age / Gender</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Last Visit</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            No patients found matching "{patientSearchQuery}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPatients.map((patient: any) => {
                                        const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'N/A';
                                        return (
                                        <tr key={patient.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{patient.name}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {age} <span className="text-gray-400">/</span> {patient.gender ? patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase() : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{patient.phone}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="outline" size="sm" onClick={() => navigate('.', { state: { tab: 'patients', patientId: patient.id } })}>
                                                    View Profile
                                                </Button>
                                            </td>
                                        </tr>
                                    )})
                                )}
                            </tbody>
                        </table>
                    </div>
                  </CardContent>
                </Card>
             </div>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Appointment Calendar</h2>
            </div>

            <DoctorCalendar onSelectDate={(date) => {
                setSelectedDate(date);
                setActiveTab('schedule');
            }} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
              <Button onClick={() => setIsReportDialogOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" /> Generate Report
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Patients Today</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{todaysSchedule.length}</div>
                        <p className="text-xs text-gray-500">Scheduled appointments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending Prescriptions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{prescriptionRequests.filter(p => p.status === 'PENDING').length}</div>
                        <p className="text-xs text-gray-500">Action required</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Show Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">
                            {todaysSchedule.length > 0 ? 
                                Math.round((todaysSchedule.filter(a => a.status === 'completed').length / todaysSchedule.length) * 100) + '%' 
                                : '--%'}
                        </div>
                        <p className="text-xs text-gray-500">Completion rate today</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Avg Rating</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">4.8</div>
                        <p className="text-xs text-gray-500">Based on patient feedback</p>
                    </CardContent>
                </Card>
            </div>

            {/* Reports List (Static for now but functional concept) */}
            <Card>
                <CardHeader>
                    <CardTitle>Generated Reports</CardTitle>
                    <CardDescription>History of generated reports (Local Session)</CardDescription>
                </CardHeader>
                <CardContent>
                    {generatedReports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                           No reports generated in this session. Click "Generate Report" to create one.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {generatedReports.map((report) => (
                                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                    <div>
                                        <h3 className="font-medium">{report.title}</h3>
                                        <p className="text-sm text-gray-500">Date: {report.date} • {report.timestamp}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Downloaded <CheckCircle className="h-3 w-3 ml-1 inline" />
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Generate Report Dialog */}
             <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Report</DialogTitle>
                        <DialogDescription>Select report type and date range.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Report Type</Label>
                             <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={reportConfig.type}
                                onChange={e => setReportConfig({...reportConfig, type: e.target.value})}
                            >
                                <option value="daily_appointments">Daily Appointment List</option>
                                <option value="prescription_summary">Prescription Summary</option>
                            </select>
                        </div>
                         <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={reportConfig.date} onChange={e => setReportConfig({...reportConfig, date: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleGenerateReport}>
                            <Download className="h-4 w-4 mr-2" /> Download CSV
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}