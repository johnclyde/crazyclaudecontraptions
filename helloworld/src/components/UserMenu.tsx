import React, { forwardRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { LoginFunction } from "../hooks/useUserData";

interface User {
  name: string;
  avatar: string;
}

interface UserMenuProps {
  user: User | null;
  isLoggedIn: boolean;
  login: LoginFunction;
  logout: () => void;
}

const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
  ({ user, isLoggedIn, login, logout }, ref) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleProfileClick = () => {
      console.log("Navigate to profile");
      setShowMenu(false);
    };

    const handleSettingsClick = () => {
      console.log("Navigate to settings");
      setShowMenu(false);
    };

    const handleLogout = () => {
      logout();
      setShowMenu(false);
    };

    if (!isLoggedIn) {
      return (
        <GoogleLogin
          onSuccess={login}
          onError={() => console.log("Login Failed")}
        />
      );
    }

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-full"
        >
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-8 h-8 rounded-full"
          />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
            <button
              onClick={handleProfileClick}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </button>
            <button
              onClick={handleSettingsClick}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  },
);

UserMenu.displayName = "UserMenu";

export default UserMenu;
