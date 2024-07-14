import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";

const Header = ({
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

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowNotifications(false);
    }
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setShowUserMenu(false);
    }
  };

  // Add click event listener
  React.useEffect(() => {
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
