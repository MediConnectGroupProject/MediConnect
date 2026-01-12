import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { RouteNames } from "../utils/RouteNames";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={RouteNames.LOGIN} replace />;
  }

  return <>{children}</>;
}
