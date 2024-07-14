import React from "react";
import Header from "./Header";
import useUserData from "../hooks/useUserData";
import useNotifications from "../hooks/useNotifications";

const GrindOlympiadsLayout = ({ children }) => {
  const { user, isLoggedIn, login, logout } = useUserData();
  const { notifications, notificationsError, markNotificationAsRead } =
    useNotifications();

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        notifications={notifications}
        notificationsError={notificationsError}
        markNotificationAsRead={markNotificationAsRead}
        login={login}
        logout={logout}
      />
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default GrindOlympiadsLayout;
