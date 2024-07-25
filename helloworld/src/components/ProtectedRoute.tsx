import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUserDataContext } from "../contexts/UserDataContext";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  adminOnly = false,
}) => {
  const { isLoggedIn, user } = useUserDataContext();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
