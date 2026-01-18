import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MockApi } from '../../services/mockApi';
import type { User } from '../../types';
import { UserCog, Shield, Activity, Lock, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await MockApi.getAllUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>System Users</CardTitle>
            <CardDescription>Manage user access and roles.</CardDescription>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" /> Register New Staff
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register New Staff Member</DialogTitle>
                    <DialogDescription>Create account for Doctors, Pharmacists, or MLTs.</DialogDescription>
                </DialogHeader>
                <StaffRegistrationForm onSuccess={(newUser) => setUsers([...users, newUser])} />
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
             <div>Loading users...</div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 font-bold">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Primary Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                       <td className="p-3 font-medium">{user.name}</td>
                       <td className="p-3 text-gray-500">{user.email}</td>
                       <td className="p-3"><Badge variant="outline">{user.primaryRole}</Badge></td>
                       <td className="p-3">
                          <span className="flex items-center gap-1 text-green-600">
                             <Shield className="h-3 w-3" /> Active
                          </span>
                       </td>
                       <td className="p-3 text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

function StaffRegistrationForm({ onSuccess }: { onSuccess: (user: User) => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'doctor' | 'pharmacist' | 'mlt' | 'receptionist'>('doctor');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newUser = await MockApi.register(email, password, name, role);
            if (newUser) {
                onSuccess(newUser);
                // Trigger close logic typically handled by parent state or radix dialog close
                 // For now, simpler implementation is fine, user can close modal
            }
        } catch (error) {
            console.error("Failed to register staff", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
             <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label>Role</Label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={role} 
                    onChange={e => setRole(e.target.value as any)}
                >
                    <option value="doctor">Doctor</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="mlt">MLT</option>
                    <option value="receptionist">Receptionist</option>
                </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register Staff'}
            </Button>
        </form>
    );
}

export function SystemStats() {
    const [stats, setStats] = useState({ totalUsers: 0, activeAppointments: 0, dailyPrescriptions: 0 });
    
    useEffect(() => {
        const fetch = async () => {
            const data = await MockApi.getSystemStats();
            setStats(data);
        }
        fetch();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">+2 new since last login</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeAppointments}</div>
                    <p className="text-xs text-muted-foreground">Scheduled for today</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Prescriptions</CardTitle>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.dailyPrescriptions}</div>
                    <p className="text-xs text-muted-foreground">Issued in last 24h</p>
                </CardContent>
            </Card>
        </div>
    );
}
