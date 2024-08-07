import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUserDataContext } from "../contexts/UserDataContext";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  adminOnly = false,
}) => {
  const { isLoggedIn, user, isAdminMode } = useUserDataContext();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [...prev, `${new Date().toISOString()}: ${info}`]);
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

  return (
    <>
      <div className="bg-yellow-100 p-4 mb-4 rounded">
        <h2 className="text-xl font-bold mb-2">
          ProtectedRoute Debug Information:
        </h2>
        <pre className="whitespace-pre-wrap">{debugInfo.join("\n")}</pre>
      </div>
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
