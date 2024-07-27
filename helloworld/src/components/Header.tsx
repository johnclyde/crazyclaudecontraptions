import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LoginFunction } from "../hooks/useUserData";
import { User } from "../types";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface HeaderProps {
  user: User | null;
  isLoggedIn: boolean;
  notifications: Notification[];
  notificationsError: string | null;
  markNotificationAsRead: (id: string) => void;
  login: LoginFunction;
  logout: () => void;
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  stagingLogin?: () => void;
  NotificationBell: React.ComponentType<HTMLDivElement>;
  UserMenu: React.ComponentType<any>;
}

const Header: React.FC<HeaderProps> = ({
  user,
  isLoggedIn,
  notifications,
  notificationsError,
  markNotificationAsRead,
  login,
  logout,
  isAdminMode,
  toggleAdminMode,
  stagingLogin,
  NotificationBell,
  UserMenu,
}) => {
  const location = useLocation();
  const isLabsPath = location.pathname.startsWith("/labs");

  const headerBackgroundColor = isAdminMode ? "bg-red-900" : "bg-gray-800";

  return (
    <header
      className={`${headerBackgroundColor} text-white p-4 sticky top-0 z-50`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          GrindOlympiads
        </Link>
        <div className="flex items-center space-x-4">
          {isLabsPath && (
            <Link to="/labs" className="text-white hover:text-gray-300">
              Components Directory
            </Link>
          )}
          {isLoggedIn && (
            <NotificationBell
              notifications={notifications}
              notificationsError={notificationsError}
              markNotificationAsRead={markNotificationAsRead}
            />
          )}
          <UserMenu
            user={user}
            isLoggedIn={isLoggedIn}
            login={login}
            logout={logout}
            isAdminMode={isAdminMode}
            toggleAdminMode={toggleAdminMode}
            stagingLogin={stagingLogin}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
