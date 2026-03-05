import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Home, LogOut, User } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import { useAuth } from '../../utils/authContext';
import { RouteNames } from '../../utils/RouteNames';
import { Badge } from '../../components/ui/badge';
import { useLogoutMutation } from '../../hooks/commonFunctionsHook';
import { Spinner } from '../../components/ui/spinner';
import logo from '../../assets/logo-mediconnect.png';

export function PortalLayout() {

    const { user } = useAuth();
    const navigate = useNavigate();
    const primaryRole = user?.primaryRole.toLowerCase();
    const _logoutMutation = useLogoutMutation();
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="MediConnect" className="h-8 w-auto mr-2" />
                        <Button variant="outline" onClick={() => navigate(`${RouteNames.DASHBOARD}/${primaryRole}`)}>
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <h1 className="text-xl font-semibold">{primaryRole && primaryRole[0].toUpperCase() + primaryRole?.slice(1).toLowerCase()} Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{user?.name}</span>
                        <Badge variant={
                            primaryRole === 'admin' ? 'outline' :
                                primaryRole === 'doctor' ? 'default' :
                                    primaryRole === 'pharmacist' ? 'secondary' : 'outline'
                        }
                        className={primaryRole === 'admin' ? 'bg-black text-white hover:bg-gray-800 border-black' : ''}
                        >{primaryRole}</Badge>
                         <Button variant="ghost" size="sm" onClick={() => navigate(`${RouteNames.PORTAL}/profile`)}>
                            <User className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" disabled={_logoutMutation.isPending} onClick={() => { _logoutMutation.mutate(); }}>
                            {_logoutMutation.isPending ? <Spinner /> : <LogOut className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            <Outlet />
        </div>
    );
}