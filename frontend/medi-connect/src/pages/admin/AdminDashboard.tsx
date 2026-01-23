import { Activity, FileText, Users, UserPlus, ShieldCheck, Download, Clock, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { useAdminStats } from "../../hooks/adminUsersHook";
import { getSystemHealth, getSystemReport } from "../../api/adminUsersApi";
import { useEffect, useState } from "react";
import { RouteNames } from "../../utils/RouteNames";
import { Badge } from "../../components/ui/badge";

import { UserProfile } from "../../components/UserProfile";

export default function AdminDashboard() {

  const navigate = useNavigate();
  const { data, isLoading, error } = useAdminStats();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);

  const [healthData, setHealthData] = useState<any>(null);
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<'users' | 'logs'>('users');

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowFullProfile(false);
    setIsDialogOpen(true);
  };

  const checkSystemHealth = async (silent = false) => {
      const toastId = silent ? null : toast.loading("Checking system health...");
      try {
          const data = await getSystemHealth();
          setHealthData(data);
          if (toastId) toast.success("Health check complete", { id: toastId });
      } catch (e) {
          if (toastId) toast.error("Health check failed", { id: toastId });
      }
  };

  useEffect(() => {
      checkSystemHealth(true);
  }, []);

  const handleExportReport = async () => {
      const toastId = toast.loading("Generating report...");
      try {
          const data = await getSystemReport(reportType);
          
          if (reportType === 'users') {
               // Handle Blob (CSV)
               const url = window.URL.createObjectURL(new Blob([data]));
               const link = document.createElement('a');
               link.href = url;
               link.setAttribute('download', `users_report_${new Date().toISOString().split('T')[0]}.csv`);
               document.body.appendChild(link);
               link.click();
               link.parentNode?.removeChild(link);
          } else {
               // Handle JSON (Logs)
               const jsonString = JSON.stringify(data, null, 2);
               const blob = new Blob([jsonString], { type: 'application/json' });
               const url = window.URL.createObjectURL(blob);
               const link = document.createElement('a');
               link.href = url;
               link.setAttribute('download', `system_logs_${new Date().toISOString()}.json`);
               document.body.appendChild(link);
               link.click();
               link.parentNode?.removeChild(link);
          }
          
          toast.success("Report downloaded", { id: toastId });
          setIsReportDialogOpen(false);
      } catch (e) {
          console.error(e);
          toast.error("Failed to export report", { id: toastId });
      }
  };

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Something went wrong fetching stats");
    }
  }, [error]);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{isLoading ? '...' : value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
        
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={data?.totalUsers || 0} icon={Users} color="text-blue-500" />
        <StatCard title="Patients" value={data?.patients || 0} icon={Users} color="text-green-500" />
        <StatCard title="Doctors" value={data?.doctors || 0} icon={Activity} color="text-purple-500" />
        <StatCard title="Pharmacists" value={data?.pharmacists || 0} icon={FileText} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Quick Actions & System */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-3" onClick={() => navigate(`${RouteNames.PORTAL}/admin`)}>
                        <UserPlus className="h-5 w-5 mr-3 text-blue-600" />
                        <div>
                            <div className="font-semibold">Manage Users</div>
                            <div className="text-xs text-gray-500">Add, edit, or suspend users</div>
                        </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-3" onClick={() => {
                        checkSystemHealth(false);
                        setIsHealthDialogOpen(true);
                    }}>
                        <ShieldCheck className="h-5 w-5 mr-3 text-green-600" />
                        <div>
                            <div className="font-semibold">System Health</div>
                            <div className="text-xs text-gray-500">Run diagnostic check</div>
                        </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-3" onClick={() => setIsReportDialogOpen(true)}>
                        <Download className="h-5 w-5 mr-3 text-gray-600" />
                        <div>
                            <div className="font-semibold">Export Reports</div>
                            <div className="text-xs text-gray-500">Download system logs</div>
                        </div>
                    </Button>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Activity className="h-8 w-8 text-green-400" />
                        <div>
                            <h3 className="text-lg font-bold">System Status</h3>
                            <p className="text-gray-400 text-sm">All services operational</p>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between">
                            <span>Database</span> 
                            <span className={healthData?.details?.[0]?.status === 'Connected' ? "text-green-400" : "text-gray-500"}>
                                {healthData?.details?.[0]?.status || 'Unknown'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>API Status</span> 
                            <span className={healthData?.details?.[1]?.status === 'Online' ? "text-green-400" : "text-gray-500"}>
                                {healthData?.details?.[1]?.status || 'Unknown'}
                            </span>
                        </div>
                        <div className="flex justify-between"><span>Last Check</span> <span>{healthData ? new Date(healthData.timestamp).toLocaleTimeString() : 'Syncing...'}</span></div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Col: Recent Activity */}
        <div className="col-span-1 md:col-span-2">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        Recent Registrations
                    </CardTitle>
                    <CardDescription>Newest users joining the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading && <p className="text-sm text-gray-500">Loading recent activity...</p>}
                        
                        {!isLoading && data?.recentUsers?.map((user: any) => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <Badge variant="outline" className="mb-1">{user.role}</Badge>
                                        <p className="text-xs text-gray-400">{new Date(user.joinedAt).toLocaleDateString()}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)}>
                                        <Eye className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {!isLoading && data?.recentUsers?.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No recent activity found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={showFullProfile ? "sm:max-w-4xl" : "sm:max-w-lg"}>
          <DialogHeader>
            <DialogTitle>{showFullProfile ? "Full User Profile" : "User Profile"}</DialogTitle>
            <DialogDescription>Details for {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          
          {showFullProfile ? (
             <div className="max-h-[70vh] overflow-y-auto pr-2">
                <UserProfile userId={selectedUser?.id} readOnly={true} />
             </div>
          ) : (
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold text-right text-sm">Name:</span>
                <span className="col-span-3 text-sm">{selectedUser?.name}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold text-right text-sm">Email:</span>
                <span className="col-span-3 text-sm">{selectedUser?.email}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold text-right text-sm">Role:</span>
                <span className="col-span-3"><Badge>{selectedUser?.role}</Badge></span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold text-right text-sm">Joined:</span>
                <span className="col-span-3 text-sm">{selectedUser?.joinedAt ? new Date(selectedUser.joinedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold text-right text-sm">User ID:</span>
                <span className="col-span-3 text-xs text-gray-500 font-mono">{selectedUser?.id}</span>
                </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
               {!showFullProfile && (
                   <Button variant="outline" onClick={() => setShowFullProfile(true)}>
                       View Full Profile
                   </Button>
               )}
               {showFullProfile && (
                   <Button variant="outline" onClick={() => setShowFullProfile(false)}>
                       Back to Summary
                   </Button>
               )}
          </div>

        </DialogContent>
      </Dialog>
      
      {/* System Health Dialog */}
      <Dialog open={isHealthDialogOpen} onOpenChange={setIsHealthDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" /> 
                    System Health Status
                </DialogTitle>
                <DialogDescription>Diagnostic results from {healthData ? new Date(healthData.timestamp).toLocaleString() : ''}</DialogDescription>
            </DialogHeader>
            {healthData && (
                <div className="grid gap-4 py-4">
                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Overall Status</span>
                        <Badge variant={healthData.status === 'Operational' ? 'default' : 'destructive'} className={healthData.status === 'Operational' ? 'bg-green-600' : ''}>
                            {healthData.status}
                        </Badge>
                     </div>
                     <div className="space-y-2">
                         <p className="text-sm font-medium text-gray-500">Component Status</p>
                         {healthData.details.map((item: any, idx: number) => (
                             <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                 <div className="flex items-center gap-2">
                                     {item.status === 'Connected' || item.status === 'Online' || item.status === 'Operational' ? 
                                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                        <XCircle className="h-4 w-4 text-red-500" />
                                     }
                                     <span>{item.component}</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     {item.latency && item.latency !== 'N/A' && <span className="text-xs text-gray-400">{item.latency}</span>}
                                     <span className="text-sm font-medium">{item.status}</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                     <div className="text-xs text-gray-400 text-center mt-2">
                         Server Uptime: {Math.floor(healthData.uptime / 60)} minutes
                     </div>
                </div>
            )}
            <DialogFooter>
                <Button onClick={() => setIsHealthDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Reports Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Export Reports</DialogTitle>
                <DialogDescription>Select the type of report to generate and download.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label>Report Type</Label>
                    <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="users">All User Accounts (CSV)</SelectItem>
                            <SelectItem value="logs">System Logs (JSON)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                    {reportType === 'users' ? 
                        "Downloads a CSV file containing all registered users, their roles, and current status." :
                        "Downloads the most recent system logs including errors and warnings in JSON format."
                    }
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleExportReport} className="gap-2">
                    <Download className="h-4 w-4" /> Download
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}