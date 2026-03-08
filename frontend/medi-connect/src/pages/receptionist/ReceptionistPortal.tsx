import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';


import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar, CreditCard, CheckCircle, XCircle, Users, FileText, Clock, Search, DollarSign, Receipt } from 'lucide-react';

export function ReceptionistPortal() {

    const [activeTab, setActiveTab] = useState('appointments');
    const [searchTerm, setSearchTerm] = useState('');

    // Paginated States
    const [apptPage, setApptPage] = useState(1);
    const [billPage, setBillPage] = useState(1);
    const [invoicePage, setInvoicePage] = useState(1);

    const [appointments, setAppointments] = useState({ data: [], pagination: { total: 0, totalPages: 1, pendingCount: 0, activeCount: 0 } });
    const [pendingBills, setPendingBills] = useState({ data: [], pagination: { total: 0, totalPages: 1, totalAmount: 0 } });
    const [invoices, setInvoices] = useState({ data: [], pagination: { total: 0, totalPages: 1 } });
    const [isLoading, setIsLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    // Modal state
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const api = await import('../../api/receptionistApi');

                // On first mount, fetch all for summary cards
                if (!hasFetched) {
                    const [appts, bills, invs] = await Promise.all([
                        api.getDailyAppointments(apptPage),
                        api.getPendingBills(billPage),
                        api.getInvoices(invoicePage)
                    ]);
                    setAppointments(appts);
                    setPendingBills(bills);
                    setInvoices(invs);
                    setHasFetched(true);
                    return;
                }

                // Normal paginated fetch for the active tab
                if (activeTab === 'appointments') {
                    const res = await api.getDailyAppointments(apptPage);
                    setAppointments(res);
                } else if (activeTab === 'payments') {
                    const res = await api.getPendingBills(billPage);
                    setPendingBills(res);
                } else if (activeTab === 'invoices') {
                    const res = await api.getInvoices(invoicePage);
                    setInvoices(res);
                }
            } catch (error) {
                console.error("Failed to fetch receptionist data", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [activeTab, apptPage, billPage, invoicePage, hasFetched]);


    const todayAppointments = appointments.data.map((a: any) => ({
        id: a.appointmentId,
        patient: a.patient?.user ? `${a.patient.user.firstName} ${a.patient.user.lastName}` : 'Unknown',
        doctor: a.doctor?.user ? `Dr. ${a.doctor.user.firstName}` : 'Unknown',
        time: new Date(a.time || a.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: a.status.toLowerCase(), // 'PENDING', 'CONFIRMED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'
        phone: a.patient?.user?.phone || 'N/A'
    }));

    const paymentQueue = pendingBills.data.map((b: any) => ({
        id: b.billId,
        patient: b.patient?.user ? `${b.patient.user.firstName} ${b.patient.user.lastName}` : 'Unknown',
        service: b.appointment ? `Consultation with Dr. ${b.appointment.doctor?.user?.firstName}` : 'Medical Service',
        amount: b.amount,
        status: b.status.toLowerCase()
    }));

    const invoiceHistory = invoices.data.map((i: any) => ({
        id: i.billId,
        patient: i.patient?.user ? `${i.patient.user.firstName} ${i.patient.user.lastName}` : 'Unknown',
        service: i.appointment ? `Consultation with Dr. ${i.appointment.doctor?.user?.firstName}` : 'Medical Service',
        amount: i.amount,
        status: i.status.toLowerCase(),
        invoiceNumber: i.invoiceNumber,
        date: new Date(i.paidDate || i.issuedDate).toLocaleDateString()
    }));

    const filteredAppointments = todayAppointments.filter(appt =>
        appt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.doctor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPayments = paymentQueue.filter(p =>
        p.patient.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInvoices = invoiceHistory.filter(i =>
        i.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConfirmAppointment = async (appointmentId: string) => {
        try {
            await import('../../api/receptionistApi').then(m => m.checkInPatient(appointmentId));
            const api = await import('../../api/receptionistApi');
            const res = await api.getDailyAppointments(apptPage);
            setAppointments(res);
        } catch (error) {
            console.error("Failed to check-in patient", error);
        }
    };

    const handleCancelAppointment = async (appointmentId: string) => {
        try {
            await import('../../api/receptionistApi').then(m => m.cancelAppointment(appointmentId));
            const api = await import('../../api/receptionistApi');
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
            await import('../../api/receptionistApi').then(m => m.confirmAppointment(appointmentId));
            const api = await import('../../api/receptionistApi');
            const res = await api.getDailyAppointments(apptPage);
            setAppointments(res);
        } catch (error) {
            console.error("Failed to confirm appointment", error);
        }
    };

    const handleAcceptPayment = async (billId: string) => {
        try {
            const api = await import('../../api/receptionistApi');
            await api.processPayment(billId, 'CASH'); // Default to CASH

            // Refresh both payments and invoices counts
            const [bills, invs] = await Promise.all([
                api.getPendingBills(billPage),
                api.getInvoices(invoicePage)
            ]);
            setPendingBills(bills);
            setInvoices(invs);
        } catch (error) {
            console.error("Failed to process payment", error);
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
            case 'paid': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{appointments.pagination.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    {appointments.pagination.pendingCount} pending confirmation
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pendingBills.pagination.total}</div>
                                <p className="text-sm text-muted-foreground">
                                    Rs. {pendingBills.pagination.totalAmount} total
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Invoices Generated</CardTitle>
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{invoices.pagination.total}</div>
                                <p className="text-xs text-muted-foreground">Total paid</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {appointments.pagination.activeCount || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Currently checked in</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="appointments">Appointments</TabsTrigger>
                            <TabsTrigger value="payments">Payments</TabsTrigger>
                            <TabsTrigger value="invoices">Invoices</TabsTrigger>
                            <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        </TabsList>

                        <TabsContent value="appointments" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Today's Appointments</CardTitle>
                                    <CardDescription>Manage appointment confirmations and cancellations</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <Search className="h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Search appointments..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="max-w-sm"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            {isLoading ? (
                                                <div className="text-center py-8 text-gray-500">Loading appointments...</div>
                                            ) : filteredAppointments.length > 0 ? (
                                                filteredAppointments.map((appointment) => (
                                                    <div key={appointment.id} className="border rounded-lg p-4 bg-white">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-gray-500" />
                                                                        <span className="font-medium">{appointment.time}</span>
                                                                    </div>
                                                                    <h3 className="font-semibold text-lg">{appointment.patient}</h3>
                                                                    <p className="text-gray-600">Dr: {appointment.doctor}</p>
                                                                    <p className="text-sm text-gray-500">{appointment.phone}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Badge className={getStatusColor(appointment.status)}>
                                                                    {appointment.status}
                                                                </Badge>
                                                                {appointment.status === 'confirmed' && (
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleConfirmAppointment(appointment.id)}
                                                                            className="bg-green-600 hover:bg-green-700 font-medium"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                                            Check In
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                {appointment.status === 'waiting' && (
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleCompleteAppointment(appointment.id)}
                                                                            className="bg-purple-600 hover:bg-purple-700 font-medium"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                                            Complete
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                {appointment.status === 'pending' && (
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleConfirmAppointmentAction(appointment.id)}
                                                                            className="bg-blue-600 hover:bg-blue-700 font-medium"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                                            Confirm
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => handleCancelAppointment(appointment.id)}
                                                                            className="font-medium"
                                                                        >
                                                                            <XCircle className="h-4 w-4 mr-1" />
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">No appointments found.</div>
                                            )}
                                        </div>

                                        {/* Pagination Controls */}
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                            <p className="text-sm text-gray-500">
                                                Showing page {apptPage} of {appointments.pagination.totalPages}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setApptPage(p => Math.max(1, p - 1))}
                                                    disabled={apptPage === 1}
                                                >
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setApptPage(p => Math.min(appointments.pagination.totalPages, p + 1))}
                                                    disabled={apptPage === appointments.pagination.totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="payments" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Processing</CardTitle>
                                    <CardDescription>Accept payments and process billing</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {isLoading ? (
                                            <div className="text-center py-8 text-gray-500">Loading payments...</div>
                                        ) : filteredPayments.length > 0 ? (
                                            filteredPayments.map((payment) => (
                                                <div key={payment.id} className="border rounded-lg p-4 bg-white">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-semibold">{payment.patient}</h3>
                                                            <p className="text-gray-600">{payment.service}</p>
                                                            <p className="text-lg font-bold text-green-600">Rs. {payment.amount}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge className={getStatusColor(payment.status)}>
                                                                {payment.status}
                                                            </Badge>
                                                            <Button onClick={() => handleAcceptPayment(payment.id)} className="font-medium">
                                                                <CreditCard className="h-4 w-4 mr-2" />
                                                                Accept Payment
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">No pending payments.</div>
                                        )}
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                        <p className="text-sm text-gray-500">
                                            Showing page {billPage} of {pendingBills.pagination.totalPages}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setBillPage(p => Math.max(1, p - 1))}
                                                disabled={billPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setBillPage(p => Math.min(pendingBills.pagination.totalPages, p + 1))}
                                                disabled={billPage === pendingBills.pagination.totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="invoices" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Invoice Management</CardTitle>
                                            <CardDescription>Generate and manage patient invoices</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {isLoading ? (
                                            <div className="text-center py-8 text-gray-500">Loading invoices...</div>
                                        ) : filteredInvoices.length > 0 ? (
                                            filteredInvoices.map((invoice) => (
                                                <div key={invoice.id} className="border rounded-lg p-4 bg-white">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-semibold">{invoice.patient}</h3>
                                                            <p className="text-gray-600">{invoice.invoiceNumber}</p>
                                                            <p className="text-sm text-gray-500">{invoice.date}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg font-bold">Rs. {invoice.amount}</span>
                                                            <Badge className={getStatusColor(invoice.status)}>
                                                                {invoice.status}
                                                            </Badge>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="font-medium"
                                                                onClick={() => {
                                                                    setSelectedInvoice(invoice);
                                                                    setShowInvoiceModal(true);
                                                                }}
                                                            >
                                                                <FileText className="h-4 w-4 mr-1" />
                                                                View
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">No invoices found.</div>
                                        )}
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                        <p className="text-sm text-gray-500">
                                            Showing page {invoicePage} of {invoices.pagination.totalPages}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setInvoicePage(p => Math.max(1, p - 1))}
                                                disabled={invoicePage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setInvoicePage(p => Math.min(invoices.pagination.totalPages, p + 1))}
                                                disabled={invoicePage === invoices.pagination.totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="schedule" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Schedule Overview</CardTitle>
                                    <CardDescription>View and manage daily schedules</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(todayAppointments.reduce((acc: any, appt: any) => {
                                            const docName = appt.doctor || 'Unassigned';
                                            if (!acc[docName]) acc[docName] = [];
                                            acc[docName].push(appt);
                                            return acc;
                                        }, {})).map(([doctor, appts]: [string, any]) => (
                                            <Card key={doctor} className="border-l-4 border-l-blue-500">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg">{doctor}</CardTitle>
                                                    <CardDescription>{(appts[0] as any).specialization || 'General Practice'}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        {(appts as any[]).map((appt: any) => (
                                                            <div key={appt.id} className="flex justify-between">
                                                                <span>{appt.time}</span>
                                                                <span className={
                                                                    appt.status === 'confirmed' ? 'text-green-600' :
                                                                        appt.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                                                                }>
                                                                    {appt.patient} {appt.status === 'cancelled' ? '(Cancelled)' : ''} {appt.status === 'pending' ? '(Pending)' : ''}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {todayAppointments.length === 0 && (
                                            <div className="col-span-3 text-center py-8 text-gray-500">
                                                No appointments scheduled for today.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Invoice Modal */}
            {showInvoiceModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 border-none">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <div>
                                <CardTitle className="text-xl text-blue-900 font-bold">Invoice Details</CardTitle>
                                <CardDescription className="text-blue-600 font-semibold tracking-wide">{selectedInvoice.invoiceNumber}</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowInvoiceModal(false)} className="rounded-full hover:bg-gray-100 transition-colors">
                                <XCircle className="h-6 w-6 text-gray-400 hover:text-red-500" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 gap-y-8 gap-x-12 mb-10">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-1">Patient Name</p>
                                    <p className="font-bold text-xl text-gray-800">{selectedInvoice.patient}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-1">Issue Date</p>
                                    <p className="font-bold text-xl text-gray-800">{selectedInvoice.date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-1">Service Description</p>
                                    <p className="text-gray-700 font-semibold">{selectedInvoice.service}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-1">Payment Status</p>
                                    <Badge className={`${getStatusColor(selectedInvoice.status)} px-4 py-1.5 font-bold rounded-full border-none`}>
                                        {selectedInvoice.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div className="bg-blue-50/70 rounded-2xl p-8 mb-8 border border-blue-100 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-900/60 font-black uppercase tracking-[0.2em] text-xs">Final Payable Amount</span>
                                    <span className="text-4xl font-black text-blue-700">Rs. {selectedInvoice.amount}</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <Button variant="outline" onClick={() => window.print()} className="px-8 py-6 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold transition-all hover:shadow-md">
                                    Print Invoice
                                </Button>
                                <Button onClick={() => setShowInvoiceModal(false)} className="px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 font-bold transition-all hover:-translate-y-0.5 active:translate-y-0">
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}