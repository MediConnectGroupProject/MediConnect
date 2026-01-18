import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

import { useAuth } from '../../utils/authContext';
import { RouteNames } from '../../utils/RouteNames';

export function DashboardLayout() {

  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Welcome back, { user?.name }!</h1>
            <p className="text-gray-600"></p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="capitalize">
              {user?.primaryRole}
            </Badge>
            <Button 
              variant="outline"
              className="font-bold cursor-pointer"
              onClick={() => navigate(`${RouteNames.PORTAL}/${user?.primaryRole}`)}
            >
              Go to Portal
            </Button>
          </div>
        </div>

        <Outlet />
        
      </div>
    </div>
  );
}