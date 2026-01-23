import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, Trash2 } from 'lucide-react';
import { addRoleMutation, allRoles, allUsers, updateRoleMutation, updateUserStateMutation, useCreateUser, useDeleteUser, useRemoveRole } from '../../hooks/adminUsersHook';
import { PaginationLay } from '../layouts/PaginationLay';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/ui/spinner';
import { CustomDropdownMenu } from '../../components/ui/customDropdownMenu';
import { useDebounce } from '../../utils/useDebounce';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Separator } from '../../components/ui/separator';

interface ComponentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  isEmailVerified: boolean;
  roles: {
    role: {
      id: number;
      name: string;
    };
    status: string;
  }[];
}

export function AdminPortal() {

  // set active tab
  const [activeTab, setActiveTab] = useState('users');

  // users related states
  const [pageExternal, setPageExternal] = useState(1);
  const [limitExternal, setLimitExternal] = useState(10);
  const [pageInternal, setPageInternal] = useState(1);
  const [limitInternal] = useState(1000); // Show all internal users by default

  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);
  const [isOpen, setIsOpen] = useState(false); // dialog state
  const [isOpenUserStatusDialog, setIsOpenUserStatusDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ComponentUser | null>(null);

  const [selectedRole, setSelectedRole] = useState('PATIENT');
  const [selectedUser, setSelectedUser] = useState<ComponentUser | null>(null);
  const [roleActions, setRoleActions] = useState<Record<number, string>>({});
  const [selectedUserState, setSelectedUserState] = useState('');
  const _updateRoleMutation = updateRoleMutation()
  const _addRoleMutation = addRoleMutation()
  const _updateUserStateMutation = updateUserStateMutation()
  const _createUserMutation = useCreateUser();
  const _deleteUserMutation = useDeleteUser();
  const _removeRoleMutation = useRemoveRole();

  // new user form state
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    roleId: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: boolean}>({});

  const roleActionOptions = [
    { value: 'ACTIVE' },
    { value: 'INACTIVE' },
    { value: 'SUSPENDED' }
  ];

  // 
  // 
  useEffect(() => {
    setPageExternal(1);
    setPageInternal(1);
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


    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    _updateRoleMutation.mutate({
      userId: selectedUser.id,
      roleId: roleId,
      action: action as "ACTIVE" | "INACTIVE" | "SUSPENDED",
    })
  }

  // submit user status change
  const handleSubmitUserStatus = () => {
    if (!selectedUser) return;

    _updateUserStateMutation.mutate({
      userId: selectedUser.id,
      status: selectedUserState,
    })
  }

  // submit add role
  const handleSubmitAddRole = () => {
    if (!selectedUser) return;
    
    // Find role ID from roles data
    const roleObj = roles?.data?.find((r: { name: string; id: number }) => r.name === selectedRole);
    if (!roleObj) return;

    _addRoleMutation.mutate({
      roleName: selectedRole,
      userId: selectedUser.id,
    }, {
        onSuccess: () => {
            // Update local state to show new role immediately
            setSelectedUser(prev => prev ? ({
                ...prev,
                roles: [...prev.roles, {
                    role: { id: roleObj.id, name: roleObj.name },
                    status: 'ACTIVE' // Default status from backend
                }]
            }) : null);
        }
    })
  }


  // data fetching
  const { data: internalUsers, isLoading: isInternalLoading, isError: isInternalError, error: internalError } = allUsers(pageInternal, limitInternal, debouncedSearch, 'internal');
  const { data: externalUsers, isLoading: isExternalLoading, isError: isExternalError, error: externalError } = allUsers(pageExternal, limitExternal, debouncedSearch, 'external');
  
  const { data: roles, isLoading: isRolesLoading, error: errorRoles, isError: isErrorRoles } = allRoles();
  const roleOptions = roles?.data?.map((r: { name: string }) => ({
    value: r.name,
  })) ?? [];

  // error toast
  if (isInternalError || isExternalError || isErrorRoles) {

    const msg = isInternalError ? internalError?.message : (isExternalError ? externalError?.message : errorRoles?.message || "Something went wrong");
    toast.error(msg);
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="approvals">Add User</TabsTrigger>
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
                  value={String(limitExternal)}
                  onChange={(x) => setLimitExternal(Number(x))}
                />
              </div>
            </div>

            {/* Internal Users Section */}
            <Card>
              <CardHeader>
                <CardTitle>Internal Users</CardTitle>
                <CardDescription>Doctors, Pharmacists, MLTs, Receptionists, and Admins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isInternalLoading &&
                    <Button variant="outline" className='hover:bg-white!' size="sm">
                      <Spinner />
                      Please wait
                    </Button>}

                  {!isInternalLoading && internalUsers?.data.map((user: ComponentUser) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{user.firstName + ' ' + user.lastName}</h3>
                          {user.roles?.map((r, index) => (
                             <Badge key={index} 
                                variant='outline'
                                className={r.role.name === 'ADMIN' ? 'bg-black text-white border-black hover:bg-gray-800' : ''}
                             >
                               {r.role.name}
                             </Badge>
                          ))}
                          <Badge variant={user.status === 'ACTIVE' ? 'secondary' : 'destructive'}>
                            {user.status}
                          </Badge>
                          {!user.isEmailVerified && (
                            <Badge variant={'destructive'}>Unverified</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button className='cursor-pointer' variant="outline" size="sm" onClick={() => { setSelectedUser(user); setIsOpen(true) }}>Manage Roles</Button>
                        <Button className='cursor-pointer' variant="destructive" size="sm" onClick={() => { setUserToDelete(user); setIsOpenDeleteDialog(true) }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {!isInternalLoading && (!internalUsers?.data || internalUsers.data.length === 0) && (
                      <div className="text-center py-4 text-gray-500 text-sm">No internal users found.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* External Users Section */}
            <Card>
              <CardHeader>
                <CardTitle>External Users (Patients)</CardTitle>
                <CardDescription>Registered patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isExternalLoading &&
                     <div className="py-4 text-center"><Spinner /></div>
                  }

                  {!isExternalLoading && externalUsers?.data.map((user: ComponentUser) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{user.firstName + ' ' + user.lastName}</h3>
                           {user.roles?.map((r, index) => (
                             <Badge key={index} variant='outline'>
                               {r.role.name}
                             </Badge>
                          ))}
                          <Badge variant={user.status === 'ACTIVE' ? 'secondary' : 'destructive'}>
                            {user.status}
                          </Badge>
                          {!user.isEmailVerified && (
                             <Badge variant={'destructive'}>Unverified</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button className='cursor-pointer' variant="destructive" size="sm" onClick={() => { setUserToDelete(user); setIsOpenDeleteDialog(true) }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  {!isExternalLoading && (!externalUsers?.data || externalUsers.data.length === 0) && (
                      <div className="text-center py-4 text-gray-500 text-sm">No patients found.</div>
                  )}

                  {!isExternalLoading && <PaginationLay
                    page={pageExternal}
                    totalPages={externalUsers?.meta.totalPages}
                    onPageChange={setPageExternal}
                  />}
                </div>
              </CardContent>
            </Card>


          </TabsContent>

          {/* Approvals Tab */}
          {/* Add User Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Add Internal User</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Create User Form */}
              <Card className="col-span-1 h-fit bg-blue-50/50 border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900">Create New Staff Account</CardTitle>
                  <CardDescription className="text-blue-700/80">
                    Manually create accounts for Doctors, Pharmacists, MLTs, Receptionists, and Admins.
                    User will be automatically verified and active.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-blue-900">First Name</label>
                         <Input 
                            className={`bg-white ${formErrors.firstName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            placeholder="John" 
                            value={newUser.firstName}
                            onChange={(e) => {
                                setNewUser({...newUser, firstName: e.target.value});
                                if (formErrors.firstName) setFormErrors({...formErrors, firstName: false});
                            }}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-blue-900">Last Name</label>
                         <Input 
                            className={`bg-white ${formErrors.lastName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            placeholder="Doe" 
                            value={newUser.lastName}
                            onChange={(e) => {
                                setNewUser({...newUser, lastName: e.target.value});
                                if (formErrors.lastName) setFormErrors({...formErrors, lastName: false});
                            }}
                         />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium text-blue-900">Email Address</label>
                       <Input 
                          className={`bg-white ${formErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          type="email" 
                          placeholder="john.doe@mediconnect.com" 
                          value={newUser.email}
                          onChange={(e) => {
                                setNewUser({...newUser, email: e.target.value});
                                if (formErrors.email) setFormErrors({...formErrors, email: false});
                            }}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium text-blue-900">Phone Number</label>
                       <Input 
                          className={`bg-white ${formErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          placeholder="+94 7X XXX XXXX" 
                          value={newUser.phone}
                          onChange={(e) => {
                                setNewUser({...newUser, phone: e.target.value});
                                if (formErrors.phone) setFormErrors({...formErrors, phone: false});
                            }}
                       />
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-blue-900">Password</label>
                       <Input 
                          className={`bg-white ${formErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          type="password"
                          placeholder="enter a password" 
                          value={newUser.password}
                          onChange={(e) => {
                                setNewUser({...newUser, password: e.target.value});
                                if (formErrors.password) setFormErrors({...formErrors, password: false});
                            }}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium text-blue-900">Role</label>
                       {isRolesLoading ? <Spinner /> : (
                          <select 
                            className={`flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.roleId ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            value={newUser.roleId}
                            onChange={(e) => {
                               setNewUser({...newUser, roleId: e.target.value});
                               if (formErrors.roleId) setFormErrors({...formErrors, roleId: false});
                            }}
                          >
                            <option value="">Select Role</option>
                            {roleOptions
                              .filter((r: { value: string }) => r.value !== 'PATIENT') // Filter out Patient role
                              .map((r: { value: string }, idx: number) => (
                                <option key={idx} value={r.value}>{r.value}</option>
                              ))
                            }
                          </select>
                       )}
                    </div>

                    <Button 
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                      disabled={_createUserMutation.isPending}
                      onClick={() => {
                         const errors: {[key: string]: boolean} = {};
                         if (!newUser.firstName) errors.firstName = true;
                         if (!newUser.lastName) errors.lastName = true;
                         if (!newUser.email) errors.email = true;
                         if (!newUser.phone) errors.phone = true;
                         if (!newUser.password) errors.password = true;
                         if (!newUser.roleId) errors.roleId = true;

                         setFormErrors(errors);

                         if(Object.keys(errors).length > 0) {
                            toast.error("Please fill in all highlighted fields");
                            return;
                         }
                         _createUserMutation.mutate({
                            firstName: newUser.firstName,
                            lastName: newUser.lastName,
                            email: newUser.email,
                            phone: newUser.phone,
                            password: newUser.password,
                            roleName: newUser.roleId
                         }, {
                            onSuccess: () => {
                               setNewUser({
                                  firstName: '',
                                  lastName: '',
                                  email: '',
                                  phone: '',
                                  password: '',
                                  roleId: ''
                               });
                               setFormErrors({});
                               // Stay on tab, list will update
                            }
                         })
                      }} 
                    >
                      {_createUserMutation.isPending ? <div className='flex items-center gap-2'><Spinner /> Creating...</div> : 'Create User'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Existing Internal Users List */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Existing Internal Users</CardTitle>
                  <CardDescription>Managing {internalUsers?.data?.length || 0} Staff Members</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {isInternalLoading && <div className="text-center py-4"><Spinner /></div>}
                      
                      {!isInternalLoading && internalUsers?.data.map((user: ComponentUser) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm">{user.firstName + ' ' + user.lastName}</h3>
                              {user.roles?.map((r, index) => (
                                 <Badge key={index} 
                                    variant='outline'
                                    className={`text-xs ${r.role.name === 'ADMIN' ? 'bg-black text-white border-black' : ''}`}
                                 >
                                   {r.role.name}
                                 </Badge>
                              ))}
                              <Badge variant={user.status === 'ACTIVE' ? 'secondary' : 'destructive'} className="text-xs">
                                {user.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button className='cursor-pointer h-7 text-xs' variant="outline" size="sm" onClick={() => { setSelectedUser(user); setIsOpenUserStatusDialog(true) }}>Status</Button>
                          </div>
                        </div>
                      ))}

                      {!isInternalLoading && (!internalUsers?.data || internalUsers.data.length === 0) && (
                          <div className="text-center py-4 text-gray-500 text-sm">No internal users found.</div>
                      )}
                   </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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

            {/* Permission Dialog */}
            <Dialog open={isOpen} onOpenChange={() => { setSelectedUser(null); setIsOpen(false) }}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add /Remove User Roles</DialogTitle>
                    <DialogDescription>Manage roles for {selectedUser?.firstName} {selectedUser?.lastName}</DialogDescription>
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
                        const roleId = val.role.id;
                        return (
                        <div className='py-2 border-b last:border-0' key={index}>
                            <div className='flex items-center gap-2 justify-end'>
                            <span className='mr-auto font-medium'>{val.role.name}</span>
                            <CustomDropdownMenu
                                title="Select Action"
                                data={roleActionOptions}
                                value={val.status}
                                onChange={(action) => handleRoleActionChange(roleId, action)}
                            />
                            <Button variant={'default'} disabled={!roleActions[roleId] || _updateRoleMutation.isPending} className='cursor-pointer whitespace-nowrap' size="sm" onClick={() => handleSubmitRoleChange(roleId)}>{_updateRoleMutation.isPending ? 'Updating...' : 'Update'}</Button>
                            
                            <Button 
                                variant={'destructive'} 
                                disabled={_removeRoleMutation.isPending} 
                                className='cursor-pointer whitespace-nowrap' 
                                size="sm"
                                onClick={() => {
                                    if(selectedUser) {
                                        _removeRoleMutation.mutate({ roleId, userId: selectedUser.id }, {
                                            onSuccess: () => {
                                                setSelectedUser(prev => prev ? ({
                                                    ...prev,
                                                    roles: prev.roles.filter(r => r.role.id !== roleId)
                                                }) : null);
                                            }
                                        })
                                    }
                                }}
                            >
                                {_removeRoleMutation.isPending ? '...' : 'Remove'}
                            </Button>
                            </div>
                        </div>
                        )
                    })}
                    </div>
                </div>

                <DialogFooter>
                    <Button className='cursor-pointer' variant="outline" onClick={() => { setSelectedUser(null); setIsOpen(false) }}>
                    Cancel
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* User Status Dialog */}
            <Dialog open={isOpenUserStatusDialog} onOpenChange={() => { setSelectedUser(null); setSelectedUserState(''); setIsOpenUserStatusDialog(false) }}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change User States</DialogTitle>
                    <DialogDescription>Update status for {selectedUser?.firstName} {selectedUser?.lastName}</DialogDescription>
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
                    <Button className='cursor-pointer' variant="outline" onClick={() => { setSelectedUser(null); setSelectedUserState(''); setIsOpenUserStatusDialog(false) }}>
                    Cancel
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isOpenDeleteDialog} onOpenChange={() => { setUserToDelete(null); setIsOpenDeleteDialog(false) }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm User Deletion</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to remove <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>? This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setUserToDelete(null); setIsOpenDeleteDialog(false) }}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            disabled={_deleteUserMutation.isPending}
                            onClick={() => {
                                if(userToDelete) {
                                    _deleteUserMutation.mutate(userToDelete.id, {
                                        onSuccess: () => {
                                            setUserToDelete(null);
                                            setIsOpenDeleteDialog(false);
                                        }
                                    });
                                }
                            }}
                        >
                            {_deleteUserMutation.isPending ? <div className='flex items-center gap-2'><Spinner /> Removing...</div> : 'Remove User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
      </div>
    </div>
  );
}