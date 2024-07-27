import React from "react";
import { Outlet } from "react-router-dom";
import useNotifications from "./hooks/useNotifications";
import useUserData from "./hooks/useUserData";

interface GrindOlympiadsLayoutProps {
  isStaging: boolean;
  Header: React.ComponentType<any>;
  NotificationBell: React.ComponentType<any>;
  UserMenu: React.ComponentType<any>;
}

const GrindOlympiadsLayout: React.FC<GrindOlympiadsLayoutProps> = ({
  isStaging,
  Header,
  NotificationBell,
  UserMenu,
}) => {
  const {
    user,
    isLoggedIn,
    setIsLoggedIn,
    login,
    logout,
    isAdminMode,
    toggleAdminMode,
    bypassLogin,
  } = useUserData();
  const { notifications, notificationsError, markNotificationAsRead } =
    useNotifications(isLoggedIn);

  const stagingLogin = isStaging ? bypassLogin : undefined;

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
        NotificationBell={NotificationBell}
        UserMenu={UserMenu}
      />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default GrindOlympiadsLayout;
