import React from "react";
import { Outlet } from "react-router-dom";
import { useUserDataContext } from "./contexts/UserDataContext";
import useNotifications from "./hooks/useNotifications";

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
  const { user, isLoggedIn, setIsLoggedIn, login, logout, bypassLogin } =
    useUserDataContext();
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
