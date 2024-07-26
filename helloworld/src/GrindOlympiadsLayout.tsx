import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import useNotifications from "./hooks/useNotifications";
import useUserData from "./hooks/useUserData";

interface GrindOlympiadsLayoutProps {
  stagingLogin?: () => void;
}

const GrindOlympiadsLayout: React.FC<GrindOlympiadsLayoutProps> = ({
  stagingLogin,
}) => {
  const {
    user,
    isLoggedIn,
    setIsLoggedIn,
    login,
    logout,
    isAdminMode,
    toggleAdminMode,
  } = useUserData();
  const { notifications, notificationsError, markNotificationAsRead } =
    useNotifications(isLoggedIn);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        notifications={notifications}
        setIsLoggedIn={setIsLoggedIn}
        notificationsError={notificationsError}
        markNotificationAsRead={markNotificationAsRead}
        login={login}
        logout={logout}
        isAdminMode={isAdminMode}
        toggleAdminMode={toggleAdminMode}
        stagingLogin={stagingLogin}
      />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default GrindOlympiadsLayout;
