import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { RouteNames } from "../utils/RouteNames";
import { Spinner } from "../components/ui/spinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
     return <div className="h-screen w-full flex items-center justify-center"><Spinner /></div>;
  }

  if (!user) {
    return <Navigate to={RouteNames.LOGIN} replace />;
  }

  return <>{children}</>;
}
