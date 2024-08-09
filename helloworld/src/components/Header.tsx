import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserDataContext } from "../contexts/UserDataContext";
import { NotificationBellProps } from "./NotificationBell";
import { UserMenuProps } from "./UserMenu";
import { NotificationType } from "../types";

interface HeaderProps {
  notifications: NotificationType[];
  notificationsError: string | null;
  markNotificationAsRead: (id: string) => void;
  NotificationBell: React.ForwardRefExoticComponent<
    NotificationBellProps & React.RefAttributes<HTMLDivElement>
  >;
  UserMenu: React.ForwardRefExoticComponent<
    UserMenuProps & React.RefAttributes<HTMLDivElement>
  >;
}

const Header: React.FC<HeaderProps> = ({
  notifications,
  notificationsError,
  markNotificationAsRead,
  NotificationBell,
  UserMenu,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isLabsPath = location.pathname.startsWith("/labs");

  const { user, isLoggedIn, login, logout, isAdminMode, toggleAdminMode } =
    useUserDataContext();

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

  const headerBackgroundColor = isAdminMode ? "bg-red-900" : "bg-gray-800";

  return (
    <header
      className={`${headerBackgroundColor} text-white p-4 sticky top-0 z-50 w-full`}
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
          {isLoggedIn ? (
            <>
              <NotificationBell
                ref={notificationRef}
                notifications={notifications}
                notificationsError={notificationsError}
                showNotifications={showNotifications}
                setShowNotifications={setShowNotifications}
                markNotificationAsRead={markNotificationAsRead}
              />
              <UserMenu
                ref={userMenuRef}
                user={user}
                isLoggedIn={isLoggedIn}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
                login={login}
                logout={logout}
                isAdminMode={isAdminMode}
                toggleAdminMode={toggleAdminMode}
              />
            </>
          ) : (
            <button
              onClick={login}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
