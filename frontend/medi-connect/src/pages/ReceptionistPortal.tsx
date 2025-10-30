import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';


import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar, CreditCard, CheckCircle, XCircle, Users, FileText, Home, LogOut, Clock, Search, DollarSign, Receipt } from 'lucide-react';
import { Separator } from '../components/ui/separator';

export function ReceptionistPortal({ user, onNavigate, onLogout }) {
    const [activeTab, setActiveTab] = useState('appointments');
    const [searchTerm, setSearchTerm] = useState('');

    const todayAppointments = [
        { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Johnson', time: '9:00 AM', status: 'confirmed', phone: '+1234567890' },
        { id: 2, patient: 'Mary Davis', doctor: 'Dr. Mike Chen', time: '10:30 AM', status: 'pending', phone: '+1987654321' },
        { id: 3, patient: 'Robert Wilson', doctor: 'Dr. Emily Davis', time: '2:00 PM', status: 'confirmed', phone: '+1555666777' },
        { id: 4, patient: 'Lisa Johnson', doctor: 'Dr. Sarah Johnson', time: '3:30 PM', status: 'cancelled', phone: '+1444555666' },
        { id: 5, patient: 'David Brown', doctor: 'Dr. Mike Chen', time: '4:00 PM', status: 'pending', phone: '+1333444555' }
    ];

    const paymentQueue = [
        { id: 1, patient: 'John Smith', service: 'Cardiology Consultation', amount: 150, status: 'pending' },
        { id: 2, patient: 'Mary Davis', service: 'General Checkup', amount: 100, status: 'pending' },
        { id: 3, patient: 'Robert Wilson', service: 'Blood Work', amount: 85, status: 'pending' }
    ];

    const invoiceHistory = [
        { id: 1, patient: 'Sarah Connor', invoiceNumber: 'INV-2024-001', amount: 200, date: '2024-01-10', status: 'paid' },
        { id: 2, patient: 'Tom Anderson', invoiceNumber: 'INV-2024-002', amount: 150, date: '2024-01-09', status: 'pending' },
        { id: 3, patient: 'Alice Walker', invoiceNumber: 'INV-2024-003', amount: 175, date: '2024-01-08', status: 'paid' }
    ];

    const handleConfirmAppointment = (appointmentId: number) => {
        // In real app, would make API call
        console.log('Confirming appointment:', appointmentId);
    };

    const handleCancelAppointment = (appointmentId: number) => {
        // In real app, would make API call
        console.log('Cancelling appointment:', appointmentId);
    };

    const handleAcceptPayment = (paymentId: number) => {
        // In real app, would process payment
        console.log('Processing payment:', paymentId);
    };

    const generateInvoice = (patientName: string) => {
        // In real app, would generate invoice
        console.log('Generating invoice for:', patientName);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'paid': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl text-gray-900">Receptionist Portal</h1>
                        <Badge variant="secondary">Receptionist</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Welcome, {user.firstName}!</span>
                        <Button variant="outline" onClick={() => onNavigate('dashboard')}>
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                        <Button variant="outline" onClick={onLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

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
                                <div className="text-2xl font-bold">{todayAppointments.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    {todayAppointments.filter(a => a.status === 'pending').length} pending confirmation
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{paymentQueue.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    ${paymentQueue.reduce((sum, p) => sum + p.amount, 0)} total
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Invoices Generated</CardTitle>
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{invoiceHistory.length}</div>
                                <p className="text-xs text-muted-foreground">This week</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">24</div>
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
                                            {todayAppointments.map((appointment) => (
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
                                                            {appointment.status === 'pending' && (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleConfirmAppointment(appointment.id)}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                        Confirm
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => handleCancelAppointment(appointment.id)}
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-1" />
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
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
                                        {paymentQueue.map((payment) => (
                                            <div key={payment.id} className="border rounded-lg p-4 bg-white">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold">{payment.patient}</h3>
                                                        <p className="text-gray-600">{payment.service}</p>
                                                        <p className="text-lg font-bold text-green-600">${payment.amount}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge className={getStatusColor(payment.status)}>
                                                            {payment.status}
                                                        </Badge>
                                                        <Button onClick={() => handleAcceptPayment(payment.id)}>
                                                            <CreditCard className="h-4 w-4 mr-2" />
                                                            Accept Payment
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
                                        <Button onClick={() => generateInvoice('New Patient')}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Generate Invoice
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {invoiceHistory.map((invoice) => (
                                            <div key={invoice.id} className="border rounded-lg p-4 bg-white">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold">{invoice.patient}</h3>
                                                        <p className="text-gray-600">{invoice.invoiceNumber}</p>
                                                        <p className="text-sm text-gray-500">{invoice.date}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-bold">${invoice.amount}</span>
                                                        <Badge className={getStatusColor(invoice.status)}>
                                                            {invoice.status}
                                                        </Badge>
                                                        <Button variant="outline" size="sm">
                                                            <FileText className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
                                        <Card className="border-l-4 border-l-blue-500">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg">Dr. Sarah Johnson</CardTitle>
                                                <CardDescription>Cardiology</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>9:00 AM</span>
                                                        <span className="text-green-600">John Smith</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>3:30 PM</span>
                                                        <span className="text-red-600">Lisa Johnson (Cancelled)</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-l-4 border-l-green-500">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg">Dr. Mike Chen</CardTitle>
                                                <CardDescription>General Practice</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>10:30 AM</span>
                                                        <span className="text-yellow-600">Mary Davis (Pending)</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>4:00 PM</span>
                                                        <span className="text-yellow-600">David Brown (Pending)</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-l-4 border-l-purple-500">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg">Dr. Emily Davis</CardTitle>
                                                <CardDescription>Dermatology</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>2:00 PM</span>
                                                        <span className="text-green-600">Robert Wilson</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}