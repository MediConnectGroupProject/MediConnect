// Pharmacist Dashboard Component
import { useEffect, useState } from 'react';
import { RouteNames } from '../../utils/RouteNames';
import { FileText, Bell, Users, Activity, PlayCircle, TrendingUp, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getDashboardStats } from '../../api/pharmacistApi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function PharmacistDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    prescriptionRequests: 0,
    lowStockAlerts: 0,
    readyForPickup: 0,
    todaysSales: 0,
    recentPrescriptions: [],
    lowStockList: [],
    salesTrend: []
  });



  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
        toast.error("Could not load dashboard statistics");
      } finally {
        // setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Calculate max value for chart scaling
  const maxSales = Math.max(...(stats.salesTrend?.map((d:any) => Number(d.amount)) || [0]), 100);

  return (
    <div className="space-y-6 pt-2 pb-8">
      
      {/* 1. Header & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 dark:from-blue-950 dark:to-gray-900 dark:border-blue-900 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Requests</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prescriptionRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending verification</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 dark:from-red-950 dark:to-gray-900 dark:border-red-900 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Low Stock</CardTitle>
            <Bell className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">Items below threshold</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100 dark:from-amber-950 dark:to-gray-900 dark:border-amber-900 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Pickup Ready</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.readyForPickup}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting patient pickup</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 dark:from-emerald-950 dark:to-gray-900 dark:border-emerald-900 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Today's Sales</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(stats.todaysSales || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pharmacy revenue</p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Main Content (Trends & Prescriptions) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Sales Chart */}
            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        Sales Trend
                    </CardTitle>
                    <CardDescription>Revenue over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.salesTrend}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#9ca3af" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="#9ca3af" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(value) => `$${value}`} 
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar 
                                    dataKey="amount" 
                                    fill="url(#colorAmount)" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Prescriptions */}
            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            Recent Requests
                        </CardTitle>
                        <CardDescription>Latest prescriptions requiring processing</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`${RouteNames.PHARMACIST_PORTAL}/?tab=prescriptions`)}>
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.recentPrescriptions && stats.recentPrescriptions.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                        {p.patient.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm">{p.patient}</h4>
                                        <p className="text-xs text-gray-500">{new Date(p.date).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                        {p.status}
                                    </Badge>
                                    <Button size="sm" onClick={() => navigate(`${RouteNames.PHARMACIST_PORTAL}/?tab=prescriptions`)}>
                                        Process
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {(!stats.recentPrescriptions || stats.recentPrescriptions.length === 0) && (
                            <div className="text-center py-8 text-gray-500 text-sm">No pending prescriptions.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>

        {/* 3. Sidebar (Low Stock & Actions) */}
        <div className="space-y-6">
            
            {/* Low Stock List */}
            <Card className="border-red-100 dark:border-red-900/30 shadow-md">
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-red-600 flex items-center gap-2 text-base">
                        <AlertCircle className="h-5 w-5" />
                        Critical Inventory
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-3">
                        {stats.lowStockList && stats.lowStockList.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[60%]">{item.name}</span>
                                <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">
                                    {item.stock} left
                                </Badge>
                            </div>
                        ))}
                        {(!stats.lowStockList || stats.lowStockList.length === 0) && (
                            <p className="text-sm text-gray-500 py-2">Inventory Levels Healthy</p>
                        )}
                    </div>
                     <Button 
                        variant="ghost" 
                        className="w-full mt-4 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                        onClick={() => navigate(`${RouteNames.PHARMACIST_PORTAL}/?tab=alerts`)}
                    >
                        View All Alerts
                    </Button>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-md bg-white dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="text-base">Quick Launch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button 
                        className="w-full justify-start h-12 text-base" 
                        onClick={() => navigate(`${RouteNames.PHARMACIST_PORTAL}/?tab=pos`)}
                    >
                        <PlayCircle className="mr-3 h-5 w-5" />
                        Open Point of Sale
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full justify-start h-12 text-base hover:bg-gray-50"
                        onClick={() => navigate(`${RouteNames.PHARMACIST_PORTAL}/?tab=prescriptions`)}
                    >
                        <FileText className="mr-3 h-5 w-5 text-gray-500" />
                        Verify Prescriptions
                    </Button>
                    <Button 
                         variant="outline" 
                         className="w-full justify-start h-12 text-base hover:bg-gray-50"
                         onClick={() => navigate(`${RouteNames.PHARMACIST_PORTAL}/?tab=inventory`)}
                    >
                        <Activity className="mr-3 h-5 w-5 text-gray-500" />
                        Manage Inventory
                    </Button>
                </CardContent>
            </Card>

        </div>

      </div>
    </div>
  );
}