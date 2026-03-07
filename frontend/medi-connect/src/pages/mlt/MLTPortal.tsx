import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { FileText, CheckCircle, TestTube, Download, Upload, Search, AlertCircle } from 'lucide-react';


export function MLTPortal() {

  const [activeTab, setActiveTab] = useState('reports');
  const [reportDetails, setReportDetails] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [labReports, setLabReports] = useState<any[]>([]);
  const [completedReports, setCompletedReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reports = await import('../../api/mltApi').then(m => m.getLabReportQueue());
        setLabReports(reports);

        const completed = await import('../../api/mltApi').then(m => m.getCompletedLabReports());
        setCompletedReports(completed);
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
    results: r.results // Keep for reference
  }));

  const filteredReports = pendingReports.filter(report => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return report.patient.toLowerCase().includes(lowerQuery) ||
      report.testType.toLowerCase().includes(lowerQuery) ||
      report.doctor.toLowerCase().includes(lowerQuery);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Recent results from completed reports state
  const recentResults = completedReports
    .map((r: any) => ({
      id: r.reportId,
      patient: r.patient?.user ? `${r.patient.user.firstName} ${r.patient.user.lastName}` : 'Unknown',
      testType: r.testType,
      completedDate: new Date(r.completedDate || r.updatedAt).toLocaleDateString(),
      results: r.results || 'Results available',
      doctor: r.doctor?.user ? `Dr. ${r.doctor.user.firstName}` : 'Unknown'
    }));

  const handleUpdateReport = async (reportId: string) => {
    try {
      await import('../../api/mltApi').then(m => m.updateLabReport(reportId, { status: 'IN_PROGRESS', results: reportDetails[reportId] }));
      // Refresh local state (optimistic or re-fetch)
      const reports = await import('../../api/mltApi').then(m => m.getLabReportQueue());
      setLabReports(reports);
      setReportDetails(prev => {
        const next = { ...prev };
        delete next[reportId];
        return next;
      });
    } catch (error) {
      console.error("Failed to update report", error);
    }
  };

  const handleMarkReady = async (reportId: string) => {
    try {
      // Mark as COMPLETED (which acts as Ready for Doctor)
      await import('../../api/mltApi').then(m => m.updateLabReport(reportId, { status: 'COMPLETED' }));

      const [reports, completed] = await Promise.all([
        import('../../api/mltApi').then(m => m.getLabReportQueue()),
        import('../../api/mltApi').then(m => m.getCompletedLabReports())
      ]);

      setLabReports(reports);
      setCompletedReports(completed);
    } catch (error) {
      console.error("Failed to mark report complete", error);
    }
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
                  {labReports.filter((r: any) => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {labReports.filter((r: any) => r.priority === 'URGENT' && (r.status === 'PENDING' || r.status === 'IN_PROGRESS')).length} urgent priority
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
                  {labReports.filter((r: any) => r.status === 'READY').length + completedReports.filter((r: any) => r.status === 'READY').length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting physician review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Reports</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completedReports.length}
                </div>
                <p className="text-xs text-muted-foreground">Historical records</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reports">Lab Reports</TabsTrigger>
              <TabsTrigger value="results">Recent Results</TabsTrigger>
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
                        placeholder="Search by patient, test, or doctor..."
                        className="max-w-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      {paginatedReports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No reports found matching "{searchQuery}"
                        </div>
                      ) : (
                        paginatedReports.map((report) => (
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
                                      value={reportDetails[report.id] || ''}
                                      onChange={(e) => setReportDetails(prev => ({ ...prev, [report.id]: e.target.value }))}
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
                                    disabled={!(reportDetails[report.id]?.trim())}
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
                        )))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-6 p-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm font-medium text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Lab Report Details</DialogTitle>
                                  <DialogDescription>
                                    Full laboratory test results for {result.patient}.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <h4 className="text-sm font-semibold">Test Type</h4>
                                    <p className="text-sm text-gray-700">{result.testType}</p>
                                  </div>
                                  <div className="grid gap-2">
                                    <h4 className="text-sm font-semibold">Ordered By</h4>
                                    <p className="text-sm text-gray-700">{result.doctor}</p>
                                  </div>
                                  <div className="grid gap-2">
                                    <h4 className="text-sm font-semibold">Completion Date</h4>
                                    <p className="text-sm text-gray-700">{result.completedDate}</p>
                                  </div>
                                  <div className="grid gap-2 mt-2">
                                    <h4 className="text-sm font-semibold text-primary">Complete Results</h4>
                                    <div className="bg-gray-50 p-3 rounded-md border text-sm whitespace-pre-wrap">
                                      {result.results}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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
