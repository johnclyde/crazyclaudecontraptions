import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUserDataContext } from "../contexts/UserDataContext";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  adminOnly = false,
}) => {
  const { isLoggedIn, user, isAdminMode } = useUserDataContext();

  const addDebugInfo = (info: string) => {
    console.log(info);
  };

  useEffect(() => {
    addDebugInfo(`ProtectedRoute mounted`);
    addDebugInfo(`isLoggedIn: ${isLoggedIn}`);
    addDebugInfo(`user: ${JSON.stringify(user)}`);
    addDebugInfo(`adminOnly: ${adminOnly}`);
    addDebugInfo(`isAdminMode: ${isAdminMode}`);
  }, [isLoggedIn, user, adminOnly, isAdminMode]);

  if (!isLoggedIn) {
    addDebugInfo("Not logged in, redirecting to home");
    return <Navigate to="/" replace />;
  }

  if (adminOnly && (!user?.isAdmin || !isAdminMode)) {
    addDebugInfo(
      "Admin only route, but user is not admin or admin mode is off",
    );
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
