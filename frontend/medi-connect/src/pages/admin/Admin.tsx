import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Shield, Search, Plus, Home, LogOut } from 'lucide-react';
import { Separator } from '../../components/ui/separator';

import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../../utils/RouteNames';
import { useAuth } from '../../utils/authContext';


export function AdminPortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('users');


  const users = [
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@mediconnect.com', role: 'doctor', status: 'active', lastLogin: '2024-01-15 09:30', permissions: 'full' },
    { id: 2, name: 'Mike Pharmacist', email: 'mike.p@mediconnect.com', role: 'pharmacist', status: 'active', lastLogin: '2024-01-15 08:45', permissions: 'standard' },
    { id: 3, name: 'John Patient', email: 'john.patient@email.com', role: 'patient', status: 'active', lastLogin: '2024-01-14 16:20', permissions: 'basic' },
    { id: 4, name: 'Dr. Emily Davis', email: 'emily.davis@mediconnect.com', role: 'doctor', status: 'pending', lastLogin: 'Never', permissions: 'none' },
    { id: 5, name: 'Admin User', email: 'admin@mediconnect.com', role: 'admin', status: 'active', lastLogin: '2024-01-15 10:00', permissions: 'admin' }
  ];

  const pendingApprovals = [
    { id: 1, type: 'doctor_registration', name: 'Dr. Michael Brown', email: 'michael.brown@email.com', licenseNumber: 'MD-12345', submittedAt: '2024-01-14 14:30', documents: 3 },
    { id: 2, type: 'pharmacist_registration', name: 'Lisa Pharmacy', email: 'lisa.pharmacy@email.com', licenseNumber: 'RPh-67890', submittedAt: '2024-01-13 11:15', documents: 2 },
    { id: 3, type: 'role_change', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@mediconnect.com', requestedRole: 'admin', submittedAt: '2024-01-12 16:45', reason: 'Promotion to department head' }
  ];

  const systemSettings = [
    { id: 1, category: 'General', setting: 'Platform Name', value: 'MediConnect', type: 'text' },
    { id: 2, category: 'Security', setting: 'Two-Factor Authentication', value: true, type: 'boolean' },
    { id: 3, category: 'Security', setting: 'Session Timeout (minutes)', value: '30', type: 'number' },
    { id: 4, category: 'N1otifications', setting: 'Email Notifications', value: true, type: 'boolean' },
    { id: 5, category: 'Notifications', setting: 'SMS Notifications', value: false, type: 'boolean' },
    { id: 6, category: 'Data', setting: 'Data Retention (days)', value: '365', type: 'number' },
    { id: 7, category: 'Backup', setting: 'Automatic Backups', value: true, type: 'boolean' },
    { id: 8, category: 'Backup', setting: 'Backup Frequency (hours)', value: '6', type: 'number' }
  ];

  const securityLogs = [
    { id: 1, timestamp: '2024-01-15 10:30:25', event: 'User Login', user: 'Dr. Sarah Johnson', ip: '192.168.1.101', status: 'success', details: 'Successful login from desktop' },
    { id: 2, timestamp: '2024-01-15 09:45:12', event: 'Failed Login', user: 'unknown@email.com', ip: '203.0.113.45', status: 'failed', details: 'Invalid credentials - 3rd attempt' },
    { id: 3, timestamp: '2024-01-15 08:22:18', event: 'Password Change', user: 'Mike Pharmacist', ip: '192.168.1.105', status: 'success', details: 'Password updated successfully' },
    { id: 4, timestamp: '2024-01-14 17:55:33', event: 'Permission Change', user: 'Admin User', ip: '192.168.1.100', status: 'success', details: 'Updated user permissions for John Patient' },
    { id: 5, timestamp: '2024-01-14 16:30:44', event: 'Data Export', user: 'Dr. Emily Davis', ip: '192.168.1.103', status: 'success', details: 'Patient reports exported' }
  ];

  const systemReports = [
    { id: 1, title: 'User Activity Report', description: 'Weekly user engagement and login statistics', lastGenerated: '2024-01-14', size: '2.3 MB', type: 'weekly' },
    { id: 2, title: 'Security Audit Report', description: 'Monthly security events and threat analysis', lastGenerated: '2024-01-12', size: '1.8 MB', type: 'monthly' },
    { id: 3, title: 'System Performance Report', description: 'Daily system health and performance metrics', lastGenerated: '2024-01-15', size: '956 KB', type: 'daily' },
    { id: 4, title: 'Data Backup Report', description: 'Backup status and data integrity verification', lastGenerated: '2024-01-15', size: '445 KB', type: 'daily' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(`${RouteNames.DASHBOARD}/admin`)}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>


            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-semibold">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name || 'Admin'}</span>

            <Badge variant="destructive">Admin</Badge>
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
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">User Management</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search users..." className="pl-9" />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage doctors, patients, pharmacists, and administrators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge variant={
                            user.role === 'admin' ? 'destructive' :
                              user.role === 'doctor' ? 'default' :
                                user.role === 'pharmacist' ? 'secondary' : 'outline'
                          }>
                            {user.role}
                          </Badge>
                          <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">Last login: {user.lastLogin} • Permissions: {user.permissions}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit Permissions</Button>
                        <Button variant="outline" size="sm">View Profile</Button>
                        {user.status === 'pending' && (
                          <Button size="sm">Approve</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Pending Approvals</h2>
              <div className="text-sm text-gray-600">{pendingApprovals.length} pending requests</div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Role-based Permissions & Approval Workflow</CardTitle>
                <CardDescription>Review and approve user registrations and role changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{approval.name}</h3>
                          <Badge variant={
                            approval.type === 'doctor_registration' ? 'default' :
                              approval.type === 'pharmacist_registration' ? 'secondary' : 'outline'
                          }>
                            {approval.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{approval.email}</p>
                        {approval.licenseNumber && (
                          <p className="text-sm text-gray-600">License: {approval.licenseNumber}</p>
                        )}
                        {approval.requestedRole && (
                          <p className="text-sm text-gray-600">Requested Role: {approval.requestedRole}</p>
                        )}
                        {approval.reason && (
                          <p className="text-sm text-gray-600">Reason: {approval.reason}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Submitted: {approval.submittedAt}
                          {approval.documents && ` • ${approval.documents} documents attached`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Documents</Button>
                        <Button variant="outline" size="sm">Reject</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">System Settings</h2>
              <Button>Save All Changes</Button>
            </div>

            <div className="grid gap-6">
              {['General', 'Security', 'Notifications', 'Data', 'Backup'].map((category) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{category} Settings</CardTitle>
                    <CardDescription>Configure {category.toLowerCase()} system parameters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {systemSettings.filter(setting => setting.category === category).map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{setting.setting}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {setting.type === 'boolean' ? (
                              <Switch />
                            ) : setting.type === 'number' ? (
                              <Input type="number" className="w-24" />
                            ) : (
                              <Input className="w-48" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Security & Logs</h2>
              <div className="flex gap-2">
                <Button variant="outline">Export Logs</Button>
                <Button>Security Scan</Button>
              </div>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Overview</CardTitle>
                  <CardDescription>Current security status and threat detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">Active Threats</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">3</div>
                      <div className="text-sm text-gray-600">Failed Logins (24h)</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">99.9%</div>
                      <div className="text-sm text-gray-600">Uptime</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">256</div>
                      <div className="text-sm text-gray-600">Active Sessions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Logs</CardTitle>
                  <CardDescription>Backup & security event monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Shield className={`h-5 w-5 ${log.status === 'success' ? 'text-green-500' : 'text-red-500'
                            }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{log.event}</h3>
                              <Badge variant={log.status === 'success' ? 'secondary' : 'destructive'}>
                                {log.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">User: {log.user} • IP: {log.ip}</p>
                            <p className="text-sm text-gray-500">{log.timestamp} • {log.details}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">System Reports</h2>
              <Button>Generate Custom Report</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>Patient statistics, daily/monthly summaries, and system analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{report.title}</h3>
                          <Badge variant="outline">{report.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <p className="text-sm text-gray-500">
                          Last generated: {report.lastGenerated} • Size: {report.size}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Download</Button>
                        <Button size="sm">Regenerate</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>Platform usage and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1,248</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">856</div>
                    <div className="text-sm text-gray-600">Active This Month</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2,340</div>
                    <div className="text-sm text-gray-600">Prescriptions</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">4,567</div>
                    <div className="text-sm text-gray-600">Appointments</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">99.8%</div>
                    <div className="text-sm text-gray-600">System Uptime</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">15.2GB</div>
                    <div className="text-sm text-gray-600">Data Storage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
