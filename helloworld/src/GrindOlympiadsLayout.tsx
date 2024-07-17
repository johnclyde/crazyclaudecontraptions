import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import useNotifications from "./hooks/useNotifications";
import useUserData from "./hooks/useUserData";

const GrindOlympiadsLayout: React.FC = () => {
  const { user, isLoggedIn, setIsLoggedIn, login, logout } = useUserData();
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
      />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default GrindOlympiadsLayout;
