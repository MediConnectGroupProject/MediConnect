import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, Trash2, Download, ShieldAlert, Activity, Database, Server, Users, FileText } from 'lucide-react';
import { addRoleMutation, allRoles, allUsers, updateRoleMutation, updateUserStateMutation, useCreateUser, useDeleteUser, useRemoveRole } from '../../hooks/adminUsersHook';
import { revokeStaffSessions } from '../../api/adminUsersApi';
import { PaginationLay } from '../layouts/PaginationLay';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/ui/spinner';
import { CustomDropdownMenu } from '../../components/ui/customDropdownMenu';
import { useDebounce } from '../../utils/useDebounce';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { Settings } from 'lucide-react';

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
  
  // Revoke Dialog State
  const [isOpenRevokeDialog, setIsOpenRevokeDialog] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
      hospitalName: 'MediConnect Hospital',
      supportEmail: 'support@mediconnect.com',
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      smsAlerts: false,
      autoBackup: true,
      enforceStrongPassword: false
  });

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

  // Fetch Settings on Load
  // Fetch Settings on Load (When entering Settings or Security tab)
  useEffect(() => {
    if (activeTab === 'settings' || activeTab === 'security') {
        fetch(`${import.meta.env.VITE_API_URL}/settings`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if(data) setSystemSettings(data);
            })
            .catch(err => console.error("Failed to load settings", err));
    }
  }, [activeTab]);

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

          {/* System Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">System Settings</h2>
              <Button onClick={async () => {
                  try {
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify(systemSettings)
                      });
                      if(res.ok) {
                          toast.success("Settings saved successfully!");
                          // Reload page or re-fetch context if needed to update global state immediately
                          window.location.reload(); 
                      } else {
                          toast.error("Failed to save settings");
                      }
                  } catch(e) {
                      toast.error("Error saving settings");
                  }
              }}>Save Changes</Button>
            </div>

            <div className="grid gap-6">
                
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>General Configuration</CardTitle>
                        <CardDescription>Basic hospital information and contact details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hospital / Clinic Name</label>
                                <Input 
                                    value={systemSettings.hospitalName} 
                                    onChange={(e) => setSystemSettings({...systemSettings, hospitalName: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Support Contact Email</label>
                                <Input 
                                    value={systemSettings.supportEmail} 
                                    onChange={(e) => setSystemSettings({...systemSettings, supportEmail: e.target.value})} 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security & Access */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security & Access Control</CardTitle>
                        <CardDescription>Manage system availability and user access</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                             <div>
                                <h3 className="font-medium">Maintenance Mode</h3>
                                <p className="text-sm text-gray-500">Lock the system for all users except Admins</p>
                             </div>
                             <Switch 
                                checked={systemSettings.maintenanceMode}
                                onCheckedChange={(c) => setSystemSettings({...systemSettings, maintenanceMode: c})}
                             />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                             <div>
                                <h3 className="font-medium">Allow New Registrations</h3>
                                <p className="text-sm text-gray-500">If disabled, only Admins can create new users</p>
                             </div>
                             <Switch 
                                checked={systemSettings.registrationEnabled}
                                onCheckedChange={(c) => setSystemSettings({...systemSettings, registrationEnabled: c})}
                             />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications & Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Manage system alerts (Toggle Only)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Email Notifications</span>
                                <Switch 
                                    checked={systemSettings.emailNotifications}
                                    onCheckedChange={(c) => setSystemSettings({...systemSettings, emailNotifications: c})}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">SMS Alerts (Urgent)</span>
                                <Switch 
                                    checked={systemSettings.smsAlerts}
                                    onCheckedChange={(c) => setSystemSettings({...systemSettings, smsAlerts: c})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>Database and backup settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between">
                                <span className="font-medium">Automated Daily Backups</span>
                                <Switch 
                                    checked={systemSettings.autoBackup}
                                    onCheckedChange={(c) => setSystemSettings({...systemSettings, autoBackup: c})}
                                />
                            </div>
                            <div className="pt-2">
                                <Button variant="outline" className="w-full">
                                    <Settings className="h-4 w-4 mr-2" /> 
                                    Configure Backup Storage
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
          </TabsContent>

          {/* Security Tab */}
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Security & Audit Logs</h2>
              <div className="flex gap-2">
                 {/* Policy: Strong Passwords */}
                 <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                    <span className="text-sm font-medium">Enforce Strong Passwords</span>
                    <Switch 
                        checked={systemSettings.enforceStrongPassword || false}
                        onCheckedChange={async (c) => {
                           const newSettings = {...systemSettings, enforceStrongPassword: c};
                           setSystemSettings(newSettings);
                           // Auto-save on toggle
                           try {
                                await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify(newSettings)
                                });
                                toast.success("Security policy updated");
                           } catch(e) { toast.error("Failed to update policy"); }
                        }}
                    />
                 </div>

                 {/* Revoke Sessions Danger Button */}
                 <Button 
                    variant="destructive" 
                    className="ml-2"
                    onClick={() => setIsOpenRevokeDialog(true)}
                 >
                    End All Staff Sessions
                 </Button>
              </div>
            </div>

            {/* Active Staff Sessions Card */}
            <div className="grid gap-6">
                 <ActiveStaffSessionsCard key={refreshKey} />
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                      <CardTitle>System Audit Logs</CardTitle>
                      <CardDescription>Monitor system access and critical actions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/reports?type=logs`, '_blank')}>
                      <Download className="h-4 w-4 mr-2" /> Download CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <AuditLogTable /> 
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">System Reports & Analytics</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <SystemHealthCard />
                <DemographicsCard />
            </div>

            <DataExportCard />
          </TabsContent>
        </Tabs>
            
            {/* ... Dialogs ... */}

            {/* Revoke Session Confirmation Dialog */}
             <Dialog open={isOpenRevokeDialog} onOpenChange={() => setIsOpenRevokeDialog(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-900 flex items-center">
                            <ShieldAlert className="h-5 w-5 mr-2 text-red-600" /> 
                            Emergency: End All Staff Sessions
                        </DialogTitle>
                        <DialogDescription>
                            This action is irreversible.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 space-y-3">
                        <div className="bg-red-50 border border-red-100 p-3 rounded-md text-sm text-red-800">
                             <p className="font-bold">What will happen:</p>
                             <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>All logged-in staff (Doctors, Pharmacists, etc.) will be <strong>logged out immediately</strong>.</li>
                                <li>The admin (you) will remain logged in.</li>
                                <li>Patient sessions are <strong>NOT</strong> affected.</li>
                             </ul>
                        </div>
                        <p className="text-sm">Use this only in case of a security breach or system maintenance.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpenRevokeDialog(false)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            disabled={isRevoking}
                            onClick={async () => {
                                setIsRevoking(true);
                                try {
                                    const res = await revokeStaffSessions();
                                    toast.success(res.message);
                                    setIsOpenRevokeDialog(false);
                                    setRefreshKey(prev => prev + 1); // Refresh Active Staff Card
                                } catch(e) {
                                    toast.error("Failed to revoke sessions");
                                } finally {
                                    setIsRevoking(false);
                                }
                            }}
                        >
                            {isRevoking ? <div className='flex items-center gap-2'><Spinner /> Revoking...</div> : 'Confirm & End Sessions'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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

function AuditLogTable() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    /* Direct API call bypassing Hook for simplicity in this specific component */
    useEffect(() => {
        setLoading(true);
        // Using the import() dynamically in previous attempt failed. Let's just use the imported function.
        // Wait, I am importing `getAuditLogs` from `adminUsersHook`.
        // Let's make sure it is exported there.
        // Actually, I added it to `adminUsersApi.ts`. `adminUsersHook` usually wraps it.
        // I should probably add it to the Top Level Import or use the API directly.
        // Let's reuse the API import pattern if possible, or just add a hook.
        
        // I'll assume I can import it from `../../api/adminUsersApi` directly for now to avoid editing another file.
        import('../../api/adminUsersApi').then(api => {
             api.getAuditLogs(page, limit).then(data => {
                if(data && data.data) {
                    setLogs(data.data);
                    setTotal(data?.meta?.total || 0);
                }
            }).catch(e => console.error(e)).finally(() => setLoading(false));
        });
       
    }, [page, limit]);

    return (
        <div className="space-y-4">
            {loading && <div className="text-center py-4"><Spinner /></div>}
            
            {!loading && logs.length === 0 && <p className="text-center text-gray-500">No logs found.</p>}

            {!loading && logs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-gray-50/50 text-sm">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'} className="text-[10px] px-1 py-0 h-5">
                                {log.status}
                            </Badge>
                            <span className="font-bold text-gray-800">{log.action}</span>
                            <span className="text-gray-400 text-xs">•</span>
                            <span className="text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-600 pl-1">
                            {log.user ? (
                                <span className="font-medium text-blue-700">{log.user.firstName} {log.user.lastName} ({log.user.email})</span>
                            ) : 'System / Guest'}
                            <span className="text-gray-400 mx-2">|</span>
                            <span className="text-gray-500">{log.details || 'No details'}</span>
                        </div>
                    </div>
                </div>
            ))}
            
            {!loading && total > limit && (
                <div className="flex justify-end gap-2 mt-2">
                    <Button 
                        variant="outline" size="sm" 
                        onClick={() => setPage(p => Math.max(1, p - 1))} 
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center text-sm">Page {page}</span>
                    <Button 
                        variant="outline" size="sm" 
                        onClick={() => setPage(p => p + 1)} 
                        disabled={page * limit >= total}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

function SystemHealthCard() {
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('../../api/adminUsersApi').then(api => {
             api.getSystemHealth().then(data => setHealth(data))
             .catch(e => console.error(e))
             .finally(() => setLoading(false));
        });
    }, []);

    const getStatusColor = (status: string) => status === 'Operational' || status === 'Online' || status === 'Connected' ? 'bg-green-500' : 'bg-red-500';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    System Health Monitor
                </CardTitle>
                <CardDescription>Real-time operational status</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <Spinner /> : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className={`h-3 w-3 rounded-full ${getStatusColor(health?.status || 'Error')}`}></div>
                                <span className="font-medium">Overall System Status</span>
                            </div>
                            <span className="font-bold">{health?.status}</span>
                        </div>
                        
                        <div className="space-y-2">
                            {health?.details?.map((d: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        {d.component === 'Database' ? <Database className="h-3 w-3" /> : <Server className="h-3 w-3" />}
                                        {d.component}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusColor(d.status) === 'bg-green-500' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {d.status}
                                        </span>
                                        {d.latency && <span className="text-xs text-gray-400 font-mono">{d.latency}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-2 text-[10px] text-gray-400 text-right">
                            Last check: {new Date(health?.timestamp).toLocaleTimeString()} • Uptime: {Math.floor(health?.uptime / 60)}m
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function DemographicsCard() {
    const [stats, setStats] = useState<any>(null);
    useEffect(() => {
         import('../../api/adminUsersApi').then(api => {
             api.getAdminDashboardStats().then(data => setStats(data));
         });
    }, []);

    if (!stats) return <Card><CardContent className="p-6"><Spinner /></CardContent></Card>;

    const total = stats.totalUsers || 1;
    const getPercent = (count: number) => ((count / total) * 100).toFixed(1) + '%';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Platform Demographics
                </CardTitle>
                <CardDescription>User distribution by role</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-5">
                    {/* Visual Bar */}
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                        <div style={{ width: getPercent(stats.patients) }} className="h-full bg-blue-500" title="Patients" />
                        <div style={{ width: getPercent(stats.doctors) }} className="h-full bg-green-500" title="Doctors" />
                        <div style={{ width: getPercent(stats.pharmacists) }} className="h-full bg-orange-500" title="Pharmacists" />
                        <div style={{ width: getPercent(stats.admins) }} className="h-full bg-gray-800" title="Admins" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Patients</span>
                                <span className="font-bold">{stats.patients}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="h-3 w-3 rounded-full bg-green-500" />
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Doctors</span>
                                <span className="font-bold">{stats.doctors}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="h-3 w-3 rounded-full bg-orange-500" />
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Pharmacists</span>
                                <span className="font-bold">{stats.pharmacists}</span>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                             <div className="h-3 w-3 rounded-full bg-gray-800" />
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Admins</span>
                                <span className="font-bold">{stats.admins}</span>
                            </div>
                        </div>
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
}

function DataExportCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-gray-700" />
                    Data Export Center
                </CardTitle>
                <CardDescription>Download system records for external analysis</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <h3 className="font-medium">User Registry</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Complete list of registered users including role, status, and join date.</p>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/reports?type=users`, '_blank')}>
                            <FileText className="h-4 w-4 mr-2" /> Export CSV
                        </Button>
                    </div>

                    <div className="p-4 border rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <h3 className="font-medium">Security Audit Logs</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Detailed security events including logins, failures, and system actions.</p>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/reports?type=logs`, '_blank')}>
                            <FileText className="h-4 w-4 mr-2" /> Export CSV
                        </Button>
                    </div>

                    <div className="p-4 border rounded-lg bg-gray-50 opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                <Activity className="h-5 w-5" />
                            </div>
                            <h3 className="font-medium">Financial Report</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Revenue and billing summaries. (Coming Soon)</p>
                        <Button variant="outline" size="sm" className="w-full" disabled>
                             Coming Soon
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ActiveStaffSessionsCard() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        import('../../api/adminUsersApi').then(api => {
             api.getActiveStaff().then(data => {
                if(data) setSessions(data);
            }).catch(e => console.error(e)).finally(() => setLoading(false));
        });
    }, []);

    if (loading) return <Card><CardContent className="p-6 text-center"><Spinner /> Checking active sessions...</CardContent></Card>;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Active Staff Sessions
                </CardTitle>
                <CardDescription>
                    {sessions.length} staff member{sessions.length !== 1 ? 's' : ''} currently online (heuristic based).
                </CardDescription>
            </CardHeader>
            <CardContent>
                {sessions.length === 0 ? (
                    <p className="text-sm text-gray-500">No active staff sessions detected.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sessions.map((s: any) => (
                            <div key={s.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                                <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-xs">
                                    {s.name.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium truncate">{s.name}</p>
                                    <p className="text-xs text-green-700 truncate">{s.role}</p>
                                    <p className="text-[10px] text-gray-400">Login: {new Date(s.loginTime).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}