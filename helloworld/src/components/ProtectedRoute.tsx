import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useUserData from "../hooks/useUserData";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  adminOnly = false,
}) => {
  const { isLoggedIn, user, isBypassLogin } = useUserData();

  if (!isLoggedIn && !isBypassLogin) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
