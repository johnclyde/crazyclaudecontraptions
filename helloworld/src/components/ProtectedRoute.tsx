import React from "react";
import { Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({}) => {
  return <Outlet />;
};

export default ProtectedRoute;
