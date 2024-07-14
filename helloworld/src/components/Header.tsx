import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";

interface HeaderProps {
  user: any; // Replace 'any' with your user type
  isLoggedIn: boolean;
  notifications: any[]; // Replace 'any' with your notification type
  notificationsError: string | null;
  markNotificationAsRead: (id: string) => void;
  login: () => void;
  logout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  isLoggedIn,
  notifications,
  notificationsError,
  markNotificationAsRead,
  login,
  logout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isLabsPath = location.pathname.startsWith("/labs");

  const handleClickOutside = (event: MouseEvent) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target as Node)
    ) {
      setShowNotifications(false);
    }
    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(event.target as Node)
    ) {
      setShowUserMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-800 text-white p-4 sticky top-0 z-50">
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
              ref={notificationRef}
              notifications={notifications}
              notificationsError={notificationsError}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              markNotificationAsRead={markNotificationAsRead}
            />
          )}
          <UserMenu
            ref={userMenuRef}
            user={user}
            isLoggedIn={isLoggedIn}
            showUserMenu={showUserMenu}
            setShowUserMenu={setShowUserMenu}
            login={login}
            logout={logout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
