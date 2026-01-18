import React, { use, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Shield, Search, Plus, Home, LogOut } from 'lucide-react';
import { addRoleMutation, allRoles, allUsers, updateRoleMutation, updateUserStateMutation } from '../../hooks/adminUsers';
import { PaginationLay } from '../layouts/PaginationLay';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/ui/spinner';
import { CustomDropdownMenu } from '../../components/ui/customDropdownMenu';
import { useDebounce } from '../../utils/useDebounce';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Separator } from '../../components/ui/separator';

export function AdminPortal() {

  // set active tab
  const [activeTab, setActiveTab] = useState('users');

  // users related states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);
  const [isOpen, setIsOpen] = useState(false); // dialog state
  const [isOpenUserStatusDialog, setIsOpenUserStatusDialog] = useState(false);

  const [selectedRole, setSelectedRole] = useState('PATIENT');
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleActions, setRoleActions] = useState<Record<number, string>>({});
  const [selectedUserState, setSelectedUserState] = useState('');
  const _updateRoleMutation = updateRoleMutation()
  const _addRoleMutation = addRoleMutation()
  const _updateUserStateMutation = updateUserStateMutation()
  const roleActionOptions = [
    { value: 'ACTIVE' },
    { value: 'INACTIVE' },
    { value: 'SUSPENDED' }
  ];

  // 
  useEffect(() => {

    setPage(1);
  }, [debouncedSearch]);

  // handle roles status
  const handleRoleActionChange = (roleId: number, action: string) => {

    setRoleActions((prev) => ({
      ...prev,
      [roleId]: action,
    }))
  }

  // submit role change
  const handleSubmitRoleChange = (roleId: number) => {
    const action = roleActions[roleId]

    if (!action) {
      toast.error("Please select an action first")
      return
    }

    _updateRoleMutation.mutate({
      userId: selectedUser.id,
      roleId: roleId,
      action: action,
    })
  }

  // submit user status change
  const handleSubmitUserStatus = () => {

    _updateUserStateMutation.mutate({
      userId: selectedUser.id,
      status: selectedUserState,
    })
  }

  // submit add role
  const handleSubmitAddRole = () => {

    _addRoleMutation.mutate({
      roleName: selectedRole,
      userId: selectedUser.id,
    })
  }


  // data fetching
  const { data: users, isLoading, isError, error } = allUsers(page, limit, debouncedSearch);
  const { data: roles, isLoading: isRolesLoading, error: errorRoles, isError: isErrorRoles } = allRoles();
  const roleOptions = roles?.data?.map((r) => ({
    value: r.name,
  })) ?? [];

  // error toast
  if (isError || isErrorRoles) {

    const msg = isError ? error?.message : errorRoles?.message || "Something went wrong";
    toast.error(msg);
  }

  return (
    <div className="min-h-screen bg-gray-50">

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
                  <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search users..." className="pr-9" />
                </div>
                <CustomDropdownMenu
                  title={`Per Page`}
                  data={[
                    { value: "10" },
                    { value: "20" },
                    { value: "50" },
                    { value: "100" },
                  ]}
                  value='10'
                  onChange={(x) => setLimit(Number(x))}
                />

                {/* <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button> */}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage doctors, patients, pharmacists, and administrators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading &&
                    <Button variant="outline" className='hover:bg-white!' size="sm">
                      <Spinner />
                      Please wait
                    </Button>}

                  {!isLoading && users?.data.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{user.firstName + ' ' + user.lastName}</h3>
                          <Badge variant='outline'>
                            {user.roles?.map((r, index) => (
                              <span key={index}>{r.role.name}</span>
                            ))}
                          </Badge>
                          <Badge variant={user.status === 'ACTIVE' ? 'secondary' : 'destructive'}>
                            {user.status}
                          </Badge>
                          {!user.isEmailVerified && (
                            <Badge variant={'destructive'}>Unverified</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">Last login: {user.lastLogin} • Permissions: {user.permissions}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button className='cursor-pointer' variant="outline" size="sm" onClick={() => { setSelectedUser(user); setIsOpenUserStatusDialog(true) }}>Edit User Status</Button>
                        <Button className='cursor-pointer' variant="outline" size="sm" onClick={() => { setSelectedUser(user); setIsOpen(true) }}>Edit Permissions</Button>

                        {/* permission dialog */}
                        <Dialog open={isOpen} onOpenChange={() => { setSelectedUser(user); setIsOpen(false) }}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add /Remove User Roles</DialogTitle>
                            </DialogHeader>

                            <div className="my-4 flex flex-col gap-4">

                              <div className='flex flex-col gap-3'>
                                <span className='mb-3 font-bold'>Select Roles To {selectedUser?.firstName + ' ' + selectedUser?.lastName}</span>

                                <div className='flex items-center'>
                                  {!isRolesLoading && <CustomDropdownMenu
                                    title="Select Role"
                                    data={roleOptions}
                                    value={selectedRole}
                                    onChange={(v) => setSelectedRole(v)}
                                  />}
                                  {isRolesLoading && <Spinner />}
                                  <Button disabled={_addRoleMutation.isPending} className='ml-auto cursor-pointer mb-3' onClick={handleSubmitAddRole}>{_addRoleMutation.isPending ? 'Adding ...' : 'Add Role'}</Button>
                                </div>

                                <span className='mx-auto'>{selectedRole} Role Selected.</span>
                              </div>

                              <Separator />

                              <div className='flex flex-col'>

                                <span className='mb-3 font-bold'>Current Roles Assigned To {selectedUser?.firstName + ' ' + selectedUser?.lastName}</span>

                                {selectedUser?.roles.map((val, index) => {

                                  const roleId = val.role.id
                                  return (

                                    <div className='flex flex-col gap-3 my-3' key={index}>
                                      <div className='flex items-center gap-3'>

                                        <span className='mr-auto'>{val.role.name}</span>
                                        <CustomDropdownMenu
                                          title="Select Action"
                                          data={roleActionOptions}
                                          value={val.status}
                                          onChange={(action) => handleRoleActionChange(roleId, action)}
                                        />
                                        <Button variant={'default'} disabled={!roleActions[roleId] || _updateRoleMutation.isPending} className='ml-auto cursor-pointer' onClick={() => handleSubmitRoleChange(roleId)}>{_updateRoleMutation.isPending ? 'Updating...' : 'Change Status'}</Button>

                                      </div>
                                    </div>
                                  )
                                })}

                              </div>
                            </div>

                            <DialogFooter>
                              <Button className='cursor-pointer' variant="outline" onClick={() => { setSelectedUser(user); setIsOpen(false) }}>
                                Cancel
                              </Button>
                              {/* <Button className='cursor-pointer' onClick={() => alert("Action performed!")}>Confirm</Button> */}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* user status dialog */}
                        <Dialog open={isOpenUserStatusDialog} onOpenChange={() => { setSelectedUser(user); setSelectedUserState(''); setIsOpenUserStatusDialog(false) }}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change User States</DialogTitle>
                            </DialogHeader>

                            <div className="my-4 flex flex-col gap-4">

                              <div className='flex flex-col gap-3'>
                                <span className='mb-3 font-bold'>User : {selectedUser?.firstName + ' ' + selectedUser?.lastName}</span>

                                <div className='flex items-center'>
                                  <CustomDropdownMenu
                                    title="Select Action"
                                    data={roleActionOptions}
                                    value={selectedUser?.status}
                                    onChange={(v) => setSelectedUserState(v)}
                                  />
                                
                                  <Button disabled={_updateUserStateMutation.isPending || selectedUserState === ''} className='ml-auto cursor-pointer mb-3' onClick={handleSubmitUserStatus}>{_updateUserStateMutation.isPending ? 'Updating ...' : 'Update'}</Button>
                                </div>

                                <span className='mx-auto'>Role will be {selectedUserState}.</span>
                              </div>
                            </div>

                            <DialogFooter>
                              <Button className='cursor-pointer' variant="outline" onClick={() => { setSelectedUser(user); setSelectedUserState(''); setIsOpenUserStatusDialog(false) }}>
                                Cancel
                              </Button>
                              {/* <Button className='cursor-pointer' onClick={() => alert("Action performed!")}>Confirm</Button> */}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}

                  {!isLoading && <PaginationLay
                    page={page}
                    totalPages={users?.meta.totalPages}
                    onPageChange={setPage}
                  />}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          {/* <TabsContent value="approvals" className="space-y-6">
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
          </TabsContent> */}

          {/* System Settings Tab
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
          {/* <TabsContent value="security" className="space-y-6">
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
          {/* <TabsContent value="reports" className="space-y-6">
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
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
}
