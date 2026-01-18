
import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { RouteNames } from "../utils/RouteNames";

type props = {

    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: props) { 

    const { user } = useAuth();

    if (!user) {
        return <Navigate to={RouteNames.LOGIN} replace />;
    }

    const roles = user.roles;

    const hasAccess = allowedRoles.some((role) => roles?.includes(role as any));

    return hasAccess ? <>{children}</> : <Navigate to="/403" replace/>;
}