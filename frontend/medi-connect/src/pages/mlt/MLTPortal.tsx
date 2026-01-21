import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { FileText, CreditCard, CheckCircle, TestTube, Download, Home, LogOut, Upload, Search, DollarSign, Receipt, AlertCircle, User } from 'lucide-react';


import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../../utils/RouteNames';
import { useAuth } from '../../utils/authContext';


export function MLTPortal() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState('reports');
  const [reportDetails, setReportDetails] = useState('');
  const [labReports, setLabReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
        try {
            const reports = await import('../../api/mltApi').then(m => m.getLabReportQueue());
            setLabReports(reports);
        } catch (error) {
            console.error("Failed to fetch lab reports", error);
        }
    }
    fetchReports();
  }, []);



  const pendingReports = labReports.map((r: any) => ({
      id: r.reportId,
      patient: r.patient?.user ? `${r.patient.user.firstName} ${r.patient.user.lastName}` : 'Unknown',
      testType: r.testType, // "Blood Test" etc as defined in seed
      orderDate: new Date(r.orderDate).toLocaleDateString(),
      doctor: r.doctor?.user ? `Dr. ${r.doctor.user.firstName}` : 'Unknown',
      status: r.status.toLowerCase(), // PENDING, IN_PROGRESS, COMPLETED
      priority: r.priority?.toLowerCase() || 'normal',
      resultData: r.resultData // Keep for reference
  }));

  // Placeholder for payments/invoices until backend support added
  const paymentQueue: any[] = [];
  const invoiceHistory: any[] = [];

  // Derive recent results from completed reports
  const recentResults = labReports
      .filter((r:any) => r.status === 'COMPLETED' || r.status === 'completed')
      .map((r:any) => ({
          id: r.reportId,
          patient: r.patient?.user ? `${r.patient.user.firstName} ${r.patient.user.lastName}` : 'Unknown',
          testType: r.testType,
          completedDate: new Date(r.updatedAt).toLocaleDateString(),
          results: r.resultData || 'Results available',
          doctor: r.doctor?.user ? `Dr. ${r.doctor.user.firstName}` : 'Unknown'
      }));

  const handleUpdateReport = async (reportId: string) => {
    try {
        await import('../../api/mltApi').then(m => m.updateLabReport(reportId, { status: 'IN_PROGRESS', resultData: reportDetails }));
        // Refresh local state (optimistic or re-fetch)
        const reports = await import('../../api/mltApi').then(m => m.getLabReportQueue());
        setLabReports(reports);
        setReportDetails('');
    } catch (error) {
        console.error("Failed to update report", error);
    }
  };

  const handleMarkReady = async (reportId: string) => {
      try {
        // Mark as COMPLETED (which acts as Ready for Doctor)
        await import('../../api/mltApi').then(m => m.updateLabReport(reportId, { status: 'COMPLETED' }));
        const reports = await import('../../api/mltApi').then(m => m.getLabReportQueue());
        setLabReports(reports);
    } catch (error) {
        console.error("Failed to mark report complete", error);
    }
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
