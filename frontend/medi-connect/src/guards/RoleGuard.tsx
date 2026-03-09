import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { RouteNames } from "../utils/RouteNames";
import { Spinner } from "../components/ui/spinner";

type props = {

    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: props) { 

    const { user, loading } = useAuth();

    if (loading) {
         return <div className="h-screen w-full flex items-center justify-center"><Spinner /></div>;
    }

    if (!user) {
        return <Navigate to={RouteNames.LOGIN} replace />;
    }

    const roles = user.roles;

    const hasAccess = allowedRoles.some((role) => roles?.includes(role as any));

    return hasAccess ? <>{children}</> : <Navigate to="/403" replace/>;
}