import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { RouteNames } from "../utils/RouteNames";
import { GetPrimaryRole } from "../utils/GetPrimaryRole";

export default function PublicRoute({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();

  if (user) {
    // already logged in → go to dashboard
    const role = GetPrimaryRole(user.roles);
    const primaryRole = role ? role.toLowerCase() : "patient";

    return <Navigate to={`${RouteNames.DASHBOARD}/${primaryRole}`} replace />;
  }

  return children;
}
