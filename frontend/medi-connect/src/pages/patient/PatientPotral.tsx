import { useState, useEffect, useRef } from "react";
import { UserProfile } from '../../components/UserProfile';
import toast, { Toaster } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Calendar, Download, Bell, CreditCard, Loader2, CalendarOff, AlertTriangle, CheckCircle2, Pill, Stethoscope, XCircle, Clock } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

import {
  getMyAppointments,
  getMyPrescriptions,
  getNotifications,
  getBillingHistory,
  getAvailableDoctors,
  getAvailableSlots,
  bookAppointment,
  cancelAppointment
} from '../../api/patientApi';

const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours in ms

function canCancelAppointment(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < CANCEL_WINDOW_MS;
}

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState("appointments");

  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [notificationsData, setNotificationsData] = useState<any[]>([]);
  const [billingData, setBillingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Book appointment dialog state
  const [bookOpen, setBookOpen] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [bookForm, setBookForm] = useState({ doctorId: '', date: '', time: '' });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState('');

  // Slot grid state
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');

  // Cancel confirmation dialog state
  const [cancelTarget, setCancelTarget] = useState<{ id: string; doctor: string; date: string } | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // QR download state — setting this renders a hidden QRCodeCanvas, then the effect captures it
  const [downloadQrId, setDownloadQrId] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Real LAN IP fetched from backend so QR codes are scannable from phones
  const [networkHost, setNetworkHost] = useState<string>(window.location.hostname);

  const fetchAppointments = async () => {
    try {
      const apptsData = await getMyAppointments();
      setAppointments(apptsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [apptsData, prescData, notifData, billData] = await Promise.all([
          getMyAppointments(),
          getMyPrescriptions(),
          getNotifications(),
          getBillingHistory(),
        ]);
        setAppointments(apptsData);
        setPrescriptions(prescData);
        setNotificationsData(notifData);
        setBillingData(billData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Fetch real LAN IP so QR codes point to the network address (not localhost)
    fetch(`${import.meta.env.VITE_API_URL}/network-host`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.host && d.host !== 'localhost') setNetworkHost(d.host); })
      .catch(() => {/* fallback stays as window.location.hostname */});
  }, []);

  const handleOpenBook = async () => {
    setBookError('');
    setBookForm({ doctorId: '', date: '', time: '' });
    setSlots([]);
    setSlotsMessage('');
    setBookOpen(true);
    try {
      const docs = await getAvailableDoctors();
      setAvailableDoctors(docs);
    } catch {
      setBookError('Failed to load doctors. Please try again.');
    }
  };

  // Fetch slots whenever doctor or date changes
  const handleDoctorOrDateChange = async (doctorId: string, date: string) => {
    if (!doctorId || !date) {
      setSlots([]);
      setSlotsMessage('');
      return;
    }
    setSlotsLoading(true);
    setSlots([]);
    setSlotsMessage('');
    setBookForm(f => ({ ...f, time: '' })); // reset selected slot
    try {
      const result = await getAvailableSlots(doctorId, date);
      setSlots(result.slots || []);
      if (!result.slots?.length) {
        setSlotsMessage(result.message || 'No slots available for this day.');
      }
    } catch {
      setSlotsMessage('Could not load time slots. Please try again.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!bookForm.doctorId || !bookForm.date || !bookForm.time) {
      setBookError('Please fill in all fields.');
      return;
    }
    setBookLoading(true);
    setBookError('');
    try {
      await bookAppointment(bookForm);
      toast.success('Appointment booked successfully!');
      setBookOpen(false);
      await fetchAppointments();
    } catch (e: any) {
      setBookError(e.message || 'Booking failed.');
    } finally {
      setBookLoading(false);
    }
  };

  const handleCancelRequest = (id: string, doctor: string, date: string) => {
    setCancelTarget({ id, doctor, date });
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    const target = cancelTarget;
    setCancelTarget(null);
    setCancellingId(target.id);
    const toastId = toast.loading('Cancelling appointment...');
    try {
      await cancelAppointment(target.id);
      toast.success('Appointment cancelled successfully.', { id: toastId });
      await fetchAppointments();
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel appointment.', { id: toastId });
    } finally {
      setCancellingId(null);
    }
  };

  // QR Code download — triggered reactively after QRCodeCanvas is painted by React
  useEffect(() => {
    if (!downloadQrId) return;
    // Give React one frame to paint the canvas
    const raf = requestAnimationFrame(() => {
      const canvas = qrCanvasRef.current;
      if (!canvas) {
        toast.error('Could not generate QR code.');
        setDownloadQrId(null);
        return;
      }
      const QR_SIZE = canvas.width; // actual pixel size (may be scaled by devicePixelRatio)
      const pad = Math.round(QR_SIZE * 0.07); // ~7% padding
      const out = document.createElement('canvas');
      out.width = QR_SIZE + pad * 2;
      out.height = QR_SIZE + pad * 2;
      const ctx = out.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(canvas, pad, pad);
      const link = document.createElement('a');
      link.download = `prescription-${downloadQrId.substring(0, 8)}.png`;
      link.href = out.toDataURL('image/png');
      link.click();
      setDownloadQrId(null);
    });
    return () => cancelAnimationFrame(raf);
  }, [downloadQrId]);

  const upcomingAppointments = appointments
    .filter((a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING')
    .map((a: any) => ({
      id: a.appointmentId,
      doctor: `${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
      specialty: a.doctor.specialization,
      date: new Date(a.date).toLocaleDateString(),
      time: new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: a.status.toLowerCase(),
      createdAt: a.createdAt,
    }));

  const appointmentHistory = appointments
    .filter((a: any) => a.status === 'COMPLETED' || a.status === 'CANCELED' || a.status === 'IN_PROGRESS')
    .map((a: any) => ({
      id: a.appointmentId,
      doctor: `${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
      specialty: a.doctor.specialization,
      date: new Date(a.date).toLocaleDateString(),
      time: new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: a.status.toLowerCase(),
    }));

  const prescriptionList = prescriptions.map((p: any) => ({
    id: p.prescriptionId,
    medication: p.prescriptionItems.map((i: any) => i.medicineName || i.dosage).join(', ') || 'N/A',
    doctor: p.appointment?.doctor?.user ? `Dr. ${p.appointment.doctor.user.firstName}` : 'Doctor',
    dateIssued: new Date(p.issuedAt).toLocaleDateString(),
    status: p.status?.toLowerCase() || 'pending',
    pharmacy: "MediConnect Pharmacy"
  }));

  const notifications = notificationsData.map((n: any) => ({
    id: n.notificationId,
    message: n.message,
    type: n.type || 'INFO',
    referenceId: n.referenceId || null,
    isRead: n.isRead,
    createdAt: n.created_at,
  }));

  // Relative time helper
  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return 'just now';
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  type NotifMeta = { icon: React.ReactElement; bg: string; border: string; label: string };
  const notifMeta: Record<string, NotifMeta> = {
    APPOINTMENT_CONFIRMED:  { icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,  bg: 'bg-green-50',  border: 'border-green-200', label: 'Appointment Confirmed' },
    CONSULTATION_STARTED:   { icon: <Stethoscope  className="h-5 w-5 text-blue-600" />,   bg: 'bg-blue-50',   border: 'border-blue-200',  label: 'Consultation Started' },
    APPOINTMENT_CANCELLED:  { icon: <XCircle       className="h-5 w-5 text-red-500" />,    bg: 'bg-red-50',    border: 'border-red-200',   label: 'Appointment Cancelled' },
    PRESCRIPTION_ISSUED:    { icon: <Pill          className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50', border: 'border-purple-200', label: 'Prescription Issued' },
    DISPENSED:              { icon: <CheckCircle2  className="h-5 w-5 text-teal-600" />,  bg: 'bg-teal-50',   border: 'border-teal-200',  label: 'Medicines Dispensed' },
    INFO:                   { icon: <Bell          className="h-5 w-5 text-gray-500" />,  bg: 'bg-gray-50',   border: 'border-gray-200',  label: 'Notification' },
  };

  const billingHistory = billingData.map((b: any) => ({
    id: b.billId,
    service: b.description || b.type,
    doctor: b.type === 'APPOINTMENT' ? 'Dr. Assigned' : null,
    pharmacy: b.type === 'PHARMACY' ? 'MediConnect Pharmacy' : null,
    date: new Date(b.issuedDate).toLocaleDateString(),
    amount: b.amount,
    status: b.status.toLowerCase()
  }));

  const statusBadgeVariant = (status: string) => {
    if (status === 'confirmed') return 'default';
    if (status === 'completed') return 'secondary';
    if (status === 'canceled') return 'destructive';
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      {/* Hidden QRCodeCanvas rendered into the React tree so useEffect can capture it cleanly */}
      {downloadQrId && (
        <div aria-hidden="true" style={{ position: 'fixed', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
          <QRCodeCanvas
            ref={qrCanvasRef}
            value={`${window.location.protocol}//${networkHost}:${window.location.port}/prescription/${downloadQrId}`}
            size={300}
            level="H"
          />
        </div>
      )}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Cancel Confirmation Dialog */}
          <Dialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) setCancelTarget(null); }}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Cancel Appointment
                </DialogTitle>
                <DialogDescription className="pt-1">
                  Are you sure you want to cancel your appointment with
                  {cancelTarget && (
                    <span className="font-semibold text-gray-900"> Dr. {cancelTarget.doctor}</span>
                  )}
                  {cancelTarget && (
                    <span> on <span className="font-semibold text-gray-900">{cancelTarget.date}</span></span>
                  )}?
                  <span className="block mt-2 text-xs text-gray-500">This action cannot be undone.</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 mt-4">
                <Button variant="outline" onClick={() => setCancelTarget(null)}>Keep Appointment</Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleCancelConfirm}
                >
                  Yes, Cancel It
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Book Appointment Dialog */}
          <Dialog open={bookOpen} onOpenChange={setBookOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Book New Appointment
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {bookError && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{bookError}</div>
                )}
                <div className="space-y-2">
                  <Label>Select Doctor</Label>
                  {availableDoctors.length === 0 ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading doctors...</div>
                  ) : (
                    <Select
                      value={bookForm.doctorId}
                      onValueChange={(v) => {
                        setBookForm(f => ({ ...f, doctorId: v }));
                        handleDoctorOrDateChange(v, bookForm.date);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDoctors.map((doc: any) => (
                          <SelectItem key={doc.doctorId} value={doc.doctorId}>
                            Dr. {doc.user.firstName} {doc.user.lastName} — {doc.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appt-date">Select Date</Label>
                  <input
                    id="appt-date"
                    type="date"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookForm.date}
                    onChange={(e) => {
                      const d = e.target.value;
                      setBookForm(f => ({ ...f, date: d }));
                      handleDoctorOrDateChange(bookForm.doctorId, d);
                    }}
                  />
                </div>

                {/* Slot Grid */}
                {bookForm.doctorId && bookForm.date && (
                  <div className="space-y-2">
                    <Label>Available Time Slots</Label>
                    {slotsLoading ? (
                      <div className="flex items-center gap-2 text-gray-500 text-sm py-4 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading slots...
                      </div>
                    ) : slotsMessage ? (
                      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md text-center">{slotsMessage}</div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
                        {slots.map((slot) => (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setBookForm(f => ({ ...f, time: slot.time }))}
                            className={`
                              text-xs py-2 px-1 rounded-md border font-medium transition-all
                              ${!slot.available
                                ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60'
                                : bookForm.time === slot.time
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-400'
                              }
                            `}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                    {bookForm.time && (
                      <p className="text-xs text-gray-500 text-center">
                        Selected: <span className="font-semibold text-blue-600">{bookForm.time}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setBookOpen(false)} disabled={bookLoading}>Cancel</Button>
                <Button onClick={handleBook} disabled={bookLoading || !bookForm.time} className="bg-blue-600 hover:bg-blue-700">
                  {bookLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Booking...</> : 'Confirm Booking'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Appointments</h2>
              <Button onClick={handleOpenBook} className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading appointments...
              </div>
            ) : (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingAppointments.length === 0 ? (
                      <div className="flex flex-col items-center py-10 text-gray-400 gap-2">
                        <CalendarOff className="h-10 w-10" />
                        <p className="text-sm">No upcoming appointments. Book one to get started!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">Dr. {appointment.doctor}</h3>
                                <Badge variant={statusBadgeVariant(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{appointment.specialty}</p>
                              <p className="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              {canCancelAppointment(appointment.createdAt) ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  disabled={cancellingId === appointment.id}
                                  onClick={() => handleCancelRequest(appointment.id, appointment.doctor, appointment.date)}
                                >
                                  {cancellingId === appointment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel'}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  title="Cancellation window has passed (24h from booking)"
                                  className="opacity-40 cursor-not-allowed"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Appointment History</CardTitle>
                    <CardDescription>Past appointments and visits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {appointmentHistory.length === 0 ? (
                      <div className="flex flex-col items-center py-10 text-gray-400 gap-2">
                        <Calendar className="h-10 w-10" />
                        <p className="text-sm">No appointment history yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {appointmentHistory.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">Dr. {appointment.doctor}</h3>
                                <Badge variant={statusBadgeVariant(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{appointment.specialty}</p>
                              <p className="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Prescriptions</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Prescriptions</CardTitle>
                <CardDescription>
                  Active medications and refills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptionList.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">
                            {prescription.medication}
                          </h3>
                          <Badge
                            variant={
                              prescription.status === "ready"
                                ? "default"
                                : prescription.status === "picked_up"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {prescription.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Prescribed by {prescription.doctor}
                        </p>
                        <p className="text-sm text-gray-500">
                          Issued: {prescription.dateIssued} •{" "}
                          {prescription.pharmacy}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {prescription.status === "ready" && (
                          <Button size="sm">Pickup Info</Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDownloadQrId(prescription.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Notifications</h2>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-1 rounded-full">
                  {notifications.filter(n => !n.isRead).length} unread
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Bell className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">You're all caught up!</p>
                  <p className="text-xs mt-1">No notifications yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => {
                  const meta = notifMeta[n.type] ?? notifMeta['INFO'];
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border ${meta.bg} ${meta.border} ${!n.isRead ? 'ring-1 ring-offset-0 ring-blue-300/40' : ''}`}
                    >
                      {/* Icon */}
                      <div className={`shrink-0 mt-0.5 p-2 rounded-full bg-white border ${meta.border}`}>
                        {meta.icon}
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{meta.label}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" />{relativeTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-snug">{n.message}</p>

                        {/* Action buttons */}
                        {n.type === 'PRESCRIPTION_ISSUED' && n.referenceId && (
                          <a
                            href={`${window.location.protocol}//${networkHost}:${window.location.port}/prescription/${n.referenceId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 underline underline-offset-2"
                          >
                            <Pill className="h-3 w-3" /> View Prescription
                          </a>
                        )}
                        {n.type === 'DISPENSED' && (
                          <button
                            onClick={() => setActiveTab('billing')}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 underline underline-offset-2"
                          >
                            <CreditCard className="h-3 w-3" /> View Billing
                          </button>
                        )}
                      </div>

                      {/* Unread dot */}
                      {!n.isRead && (
                        <div className="shrink-0 mt-2 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Billing & Payments</h2>
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  Payments and outstanding balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingHistory.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{bill.service}</h3>
                          <Badge
                            variant={
                              bill.status === "paid"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {bill.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {bill.doctor || bill.pharmacy}
                        </p>
                        <p className="text-sm text-gray-500">{bill.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${bill.amount}</p>
                        {bill.status === "pending" && (
                          <Button size="sm" className="mt-2">
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>





          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-semibold">Profile & Settings</h2>
            <UserProfile isMe={true} role="patient" />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
