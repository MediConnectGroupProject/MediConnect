import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Calendar, CheckCircle, XCircle, Users, Clock, Search, DollarSign, Receipt } from 'lucide-react';

export default function ReceptionistDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [apptPage, setApptPage] = useState(1);

  const [appointments, setAppointments] = useState({ data: [], pagination: { total: 0, totalPages: 1, pendingCount: 0, activeCount: 0 } });
  const [stats, setStats] = useState({ pendingPayments: 0, totalRevenue: 0, paidInvoices: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const api = await import('../../api/receptionistApi');

        // Fetch appointments and other stats for the summary
        const [appts, bills, invs] = await Promise.all([
          api.getDailyAppointments(apptPage),
          api.getPendingBills(1),
          api.getInvoices(1)
        ]);

        setAppointments(appts);
        setStats({
          pendingPayments: bills.pagination.total,
          totalRevenue: bills.pagination.totalAmount,
          paidInvoices: invs.pagination.total
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apptPage]);

  const mappedAppointments = appointments.data.map((a: any) => ({
    id: a.appointmentId,
    patient: a.patient?.user ? `${a.patient.user.firstName} ${a.patient.user.lastName}` : 'Unknown',
    doctor: a.doctor?.user ? `Dr. ${a.doctor.user.firstName}` : 'Unknown',
    time: new Date(a.time || a.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: a.status.toLowerCase(),
    phone: a.patient?.user?.phone || 'N/A'
  }));

  const filteredAppointments = mappedAppointments.filter(appt =>
    appt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const api = await import('../../api/receptionistApi');
      await api.checkInPatient(appointmentId);
      const res = await api.getDailyAppointments(apptPage);
      setAppointments(res);
    } catch (error) {
      console.error("Failed to check-in patient", error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const api = await import('../../api/receptionistApi');
      await api.cancelAppointment(appointmentId);
      const res = await api.getDailyAppointments(apptPage);
      setAppointments(res);
    } catch (error) {
      console.error("Failed to cancel appointment", error);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const api = await import('../../api/receptionistApi');
      await api.completeAppointment(appointmentId);
      const res = await api.getDailyAppointments(apptPage);
      setAppointments(res);
    } catch (error) {
      console.error("Failed to complete appointment", error);
    }
  };

  const handleConfirmAppointmentAction = async (appointmentId: string) => {
    try {
      const api = await import('../../api/receptionistApi');
      await api.confirmAppointment(appointmentId);
      const res = await api.getDailyAppointments(apptPage);
      setAppointments(res);
    } catch (error) {
      console.error("Failed to confirm appointment", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waiting': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled':
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Receptionist Dashboard</h1>
          <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600">Today's Appointments</CardTitle>
              <Calendar className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-blue-900">{appointments.pagination.total}</div>
              <p className="text-xs text-blue-600/70 font-medium mt-1">
                {appointments.pagination.pendingCount} awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-600">Pending Payments</CardTitle>
              <DollarSign className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-amber-900">{stats.pendingPayments}</div>
              <p className="text-xs text-amber-600/70 font-medium mt-1">
                Rs. {stats.totalRevenue} outstanding
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-600">Paid Invoices</CardTitle>
              <Receipt className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-emerald-900">{stats.paidInvoices}</div>
              <p className="text-xs text-emerald-600/70 font-medium mt-1">All settled bills</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-indigo-600">Active Patients</CardTitle>
              <Users className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-indigo-900">{appointments.pagination.activeCount}</div>
              <p className="text-xs text-indigo-600/70 font-medium mt-1">Currently in hospital</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Appointments List */}
        <Card className="border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="border-b bg-gray-50/50 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Patient Appointment Queue</CardTitle>
                <CardDescription className="text-gray-500 font-medium">Real-time status management for today's visits</CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 font-medium">Synchronizing data...</p>
                </div>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-5 hover:bg-gray-50/80 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-5">
                        <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-blue-100 transition-colors">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">{appointment.time}</span>
                            <h3 className="font-bold text-lg text-gray-900">{appointment.patient}</h3>
                          </div>
                          <p className="text-gray-600 font-medium flex items-center gap-2">
                            <span className="text-gray-400 font-normal">Assigned to</span> {appointment.doctor}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm text-gray-500 tabular-nums">{appointment.phone}</p>
                            <Badge className={`${getStatusColor(appointment.status)} px-3 py-0.5 font-bold uppercase text-[10px] tracking-widest border-none shadow-sm`}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {appointment.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmAppointment(appointment.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 shadow-lg shadow-green-100 hover:shadow-green-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Reception Check-In
                          </Button>
                        )}
                        {appointment.status === 'waiting' && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteAppointment(appointment.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 shadow-lg shadow-purple-100 hover:shadow-purple-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Completed
                          </Button>
                        )}
                        {appointment.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleConfirmAppointmentAction(appointment.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="text-red-500 border-red-100 hover:bg-red-50 font-bold px-5 hover:text-red-600 transition-all"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Search className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-lg font-bold">No matching appointments</p>
                  <p className="text-gray-400">Try adjusting your search criteria or refresh the page.</p>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Page <span className="text-blue-600">{apptPage}</span> of <span className="text-blue-600">{appointments.pagination.totalPages}</span>
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApptPage(p => Math.max(1, p - 1))}
                  disabled={apptPage === 1}
                  className="px-6 font-bold text-gray-700 bg-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApptPage(p => Math.min(appointments.pagination.totalPages, p + 1))}
                  disabled={apptPage === appointments.pagination.totalPages}
                  className="px-6 font-bold text-gray-700 bg-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}