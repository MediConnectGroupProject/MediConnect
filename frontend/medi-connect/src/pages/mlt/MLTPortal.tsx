import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { FileText, CreditCard, CheckCircle, TestTube, Download, Home, LogOut, Upload, Search, DollarSign, Receipt, AlertCircle } from 'lucide-react';


import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../../utils/RouteNames';
import { useAuth } from '../../utils/authContext';


export function MLTPortal() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState('reports');

  const [reportDetails, setReportDetails] = useState('');

  const pendingReports = [
    { id: 1, patient: 'John Smith', testType: 'Complete Blood Count', orderDate: '2024-01-10', doctor: 'Dr. Sarah Johnson', status: 'in_progress', priority: 'normal' },
    { id: 2, patient: 'Mary Davis', testType: 'Lipid Panel', orderDate: '2024-01-10', doctor: 'Dr. Mike Chen', status: 'pending', priority: 'urgent' },
    { id: 3, patient: 'Robert Wilson', testType: 'Thyroid Function', orderDate: '2024-01-09', doctor: 'Dr. Emily Davis', status: 'completed', priority: 'normal' },
    { id: 4, patient: 'Lisa Johnson', testType: 'Diabetes Panel', orderDate: '2024-01-09', doctor: 'Dr. Sarah Johnson', status: 'ready', priority: 'normal' },
    { id: 5, patient: 'David Brown', testType: 'Liver Function', orderDate: '2024-01-08', doctor: 'Dr. Mike Chen', status: 'in_progress', priority: 'urgent' }
  ];

  const paymentQueue = [
    { id: 1, patient: 'John Smith', service: 'Complete Blood Count', amount: 85, status: 'pending' },
    { id: 2, patient: 'Mary Davis', service: 'Lipid Panel', amount: 120, status: 'pending' },
    { id: 3, patient: 'Lisa Johnson', service: 'Diabetes Panel', amount: 95, status: 'pending' }
  ];

  const invoiceHistory = [
    { id: 1, patient: 'Sarah Connor', invoiceNumber: 'LAB-2024-001', amount: 150, date: '2024-01-10', status: 'paid', testType: 'Full Panel' },
    { id: 2, patient: 'Tom Anderson', invoiceNumber: 'LAB-2024-002', amount: 85, date: '2024-01-09', status: 'pending', testType: 'Blood Work' },
    { id: 3, patient: 'Alice Walker', invoiceNumber: 'LAB-2024-003', amount: 110, date: '2024-01-08', status: 'paid', testType: 'Thyroid Test' }
  ];

  const recentResults = [
    { id: 1, patient: 'Robert Wilson', testType: 'Thyroid Function', completedDate: '2024-01-10', results: 'Normal', doctor: 'Dr. Emily Davis' },
    { id: 2, patient: 'Sarah Connor', testType: 'Complete Blood Count', completedDate: '2024-01-09', results: 'Abnormal - See notes', doctor: 'Dr. Sarah Johnson' },
    { id: 3, patient: 'Tom Anderson', testType: 'Lipid Panel', completedDate: '2024-01-08', results: 'Normal', doctor: 'Dr. Mike Chen' }
  ];

  const handleUpdateReport = (reportId: number) => {
    // In real app, would update report in database
    console.log('Updating report:', reportId, 'Details:', reportDetails);
    setReportDetails('');
  };

  const handleMarkReady = (reportId: number) => {
    console.log('Marking report as ready:', reportId);
  };

  const handleAcceptPayment = (paymentId: number) => {
    console.log('Accepting payment:', paymentId);
  };

  const generateInvoice = (patientName: string) => {
    console.log('Generating invoice for:', patientName);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl text-gray-900">MLT Portal</h1>
            <Badge variant="secondary">Medical Lab Technician</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, MLT!</span>
            <Button variant="outline" onClick={() => navigate(`${RouteNames.DASHBOARD}/mlt`)}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>

            <Button variant="outline" onClick={() => {
              logout();
              navigate(RouteNames.LOGIN);
            }}>
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
                <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                <TestTube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pendingReports.filter(r => r.status === 'pending' || r.status === 'in_progress').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingReports.filter(r => r.priority === 'urgent').length} urgent priority
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready Reports</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pendingReports.filter(r => r.status === 'ready' || r.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting physician review</p>
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
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reports">Lab Reports</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Laboratory Reports</CardTitle>
                  <CardDescription>Update report details and mark reports as ready</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Search className="h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search reports..."
                        className="max-w-sm"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      {pendingReports.map((report) => (
                        <div key={report.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{report.patient}</h3>
                                <Badge className={getPriorityColor(report.priority)}>
                                  {report.priority}
                                </Badge>
                                {report.priority === 'urgent' && <AlertCircle className="h-4 w-4 text-red-500" />}
                              </div>
                              <p className="text-gray-600 mb-1">Test: {report.testType}</p>
                              <p className="text-sm text-gray-500 mb-1">Ordered: {report.orderDate}</p>
                              <p className="text-sm text-gray-500">Doctor: {report.doctor}</p>
                              
                              {(report.status === 'pending' || report.status === 'in_progress') && (
                                <div className="mt-3 space-y-2">
                                  <Textarea
                                    placeholder="Add report details and results..."
                                    value={reportDetails}
                                    onChange={(e) => setReportDetails(e.target.value)}
                                    className="w-full"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <Badge className={getStatusColor(report.status)}>
                                {report.status.replace('_', ' ')}
                              </Badge>
                              {report.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateReport(report.id)}
                                  disabled={!reportDetails.trim()}
                                >
                                  <Upload className="h-4 w-4 mr-1" />
                                  Update Report
                                </Button>
                              )}
                              {report.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkReady(report.id)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Mark Ready
                                </Button>
                              )}
                              {report.status === 'completed' && (
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
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
                  <CardDescription>Accept payments for laboratory services</CardDescription>
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
                      <CardDescription>Generate and manage laboratory service invoices</CardDescription>
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
                            <p className="text-gray-600">{invoice.testType}</p>
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

            <TabsContent value="results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Results</CardTitle>
                  <CardDescription>View completed laboratory test results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{result.patient}</h3>
                            <p className="text-gray-600">{result.testType}</p>
                            <p className="text-sm text-gray-500">Completed: {result.completedDate}</p>
                            <p className="text-sm text-gray-500">Doctor: {result.doctor}</p>
                            <div className="mt-2">
                              <span className="text-sm font-medium">Results: </span>
                              <span className={`text-sm ${result.results.includes('Normal') ? 'text-green-600' : 'text-red-600'}`}>
                                {result.results}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download Report
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
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
