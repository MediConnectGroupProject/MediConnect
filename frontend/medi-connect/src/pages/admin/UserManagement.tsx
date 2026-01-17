import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MockApi } from '../../services/mockApi';
import type { User } from '../../types';
import { UserCog, Shield, Activity, Lock } from 'lucide-react';

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
      <CardHeader>
        <CardTitle>System Users</CardTitle>
        <CardDescription>Manage user access and roles.</CardDescription>
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
