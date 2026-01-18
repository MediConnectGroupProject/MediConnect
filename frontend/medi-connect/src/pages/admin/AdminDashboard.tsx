import { Activity, FileText, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { userCount } from "../../hooks/adminUsers";
import { useEffect } from "react";
import { RouteNames } from "../../utils/RouteNames";


export default function AdminDashboard() {

  const navigate = useNavigate();

  const { data, isLoading, error } = userCount();

  useEffect(() => {

    if (error) {

      toast.error(error.message || "Something went wrong");
    }
  }, [error]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`${RouteNames.PORTAL}/admin`)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {!isLoading && <div className="text-2xl font-bold">{data}</div>}
            {isLoading && <div className="text-2xl font-bold">Loading...</div>}
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-5 w-5" />
              User Management
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Activity className="h-5 w-5" />
              System Settings
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-5 w-5" />
              Reports
            </Button>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
}