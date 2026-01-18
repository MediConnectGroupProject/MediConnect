import { useState } from "react";
import { UserProfile } from '../../components/UserProfile';
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
import {
  Calendar,
  FileText,
  CreditCard,
  Bell,
  Download,
  Home,
  LogOut,
} from "lucide-react";
import { Separator } from "../../components/ui/separator";

import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../../utils/RouteNames';
import { useAuth } from '../../utils/authContext';


export default function PatientPortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("appointments");


  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      date: "2024-01-15",
      time: "2:00 PM",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Mike Chen",
      specialty: "General Practice",
      date: "2024-01-20",
      time: "10:30 AM",
      status: "pending",
    },
    {
      id: 3,
      doctor: "Dr. Emily Davis",
      specialty: "Dermatology",
      date: "2024-01-25",
      time: "3:15 PM",
      status: "confirmed",
    },
  ];

  const appointmentHistory = [
    {
      id: 4,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      date: "2024-01-05",
      time: "2:00 PM",
      status: "completed",
    },
    {
      id: 5,
      doctor: "Dr. Mike Chen",
      specialty: "General Practice",
      date: "2023-12-20",
      time: "11:00 AM",
      status: "completed",
    },
  ];

  const prescriptions = [
    {
      id: 1,
      medication: "Lisinopril 10mg",
      doctor: "Dr. Sarah Johnson",
      dateIssued: "2024-01-05",
      status: "ready",
      pharmacy: "MediPharm Plus",
    },
    {
      id: 2,
      medication: "Metformin 500mg",
      doctor: "Dr. Mike Chen",
      dateIssued: "2023-12-20",
      status: "picked_up",
      pharmacy: "HealthCare Pharmacy",
    },
    {
      id: 3,
      medication: "Vitamin D3 1000IU",
      doctor: "Dr. Emily Davis",
      dateIssued: "2024-01-03",
      status: "processing",
      pharmacy: "MediPharm Plus",
    },
  ];

  const notifications = [
    {
      id: 1,
      title: "Appointment Reminder",
      message: "Your appointment with Dr. Sarah Johnson is tomorrow at 2:00 PM",
      time: "2 hours ago",
      type: "reminder",
    },
    {
      id: 2,
      title: "Prescription Ready",
      message:
        "Your Lisinopril prescription is ready for pickup at MediPharm Plus",
      time: "1 day ago",
      type: "prescription",
    },
    {
      id: 3,
      title: "Test Results Available",
      message:
        "Your blood work results are now available in your health records",
      time: "3 days ago",
      type: "results",
    },
  ];

  const billingHistory = [
    {
      id: 1,
      service: "Cardiology Consultation",
      doctor: "Dr. Sarah Johnson",
      date: "2024-01-05",
      amount: 150,
      status: "paid",
    },
    {
      id: 2,
      service: "Blood Work",
      doctor: "Dr. Mike Chen",
      date: "2023-12-20",
      amount: 85,
      status: "pending",
    },
    {
      id: 3,
      service: "Prescription Fill",
      pharmacy: "MediPharm Plus",
      date: "2024-01-03",
      amount: 25,
      status: "paid",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(`${RouteNames.DASHBOARD}/patient`)}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>


            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-semibold">Patient Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name || 'Patient'}
            </span>

            <Badge variant="secondary">Patient</Badge>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Appointments</h2>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">
                              {appointment.doctor}
                            </h3>
                            <Badge
                              variant={
                                appointment.status === "confirmed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {appointment.specialty}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.date} at {appointment.time}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment History</CardTitle>
                  <CardDescription>
                    Past appointments and visits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointmentHistory.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">
                              {appointment.doctor}
                            </h3>
                            <Badge variant="outline">Completed</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {appointment.specialty}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.date} at {appointment.time}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Prescriptions</h2>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View e-Prescriptions (QR Code)
              </Button>
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
                  {prescriptions.map((prescription) => (
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
                        <Button variant="outline" size="sm">
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
            <h2 className="text-2xl font-semibold">Notifications</h2>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-4 ${
                        index !== notifications.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Bell className="h-4 w-4 mt-1 text-blue-500" />
                        <div className="flex-1">
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
            <UserProfile readOnly={false} />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
