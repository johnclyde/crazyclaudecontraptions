import React, { forwardRef } from "react";
import { GoogleLogin, LoginFunction } from "@react-oauth/google";

interface User {
  name: string;
  avatar: string;
}

interface UserMenuProps {
  user: User | null;
  isLoggedIn: boolean;
  showUserMenu: boolean;
  setShowUserMenu: React.Dispatch<React.SetStateAction<boolean>>;
  login: LoginFunction;
  logout: () => void;
}

const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
  ({ user, isLoggedIn, showUserMenu, setShowUserMenu, login, logout }, ref) => {
    const handleProfileClick = () => {
      console.log("Navigate to profile");
      setShowUserMenu(false);
    };

    const handleSettingsClick = () => {
      console.log("Navigate to settings");
      setShowUserMenu(false);
    };

    const handleLogout = () => {
      logout();
      setShowUserMenu(false);
    };

    const handleGoogleSignInFailure = () => {
      console.error("Google Sign-In Failure");
    };

    return (
      <div className="relative" ref={ref}>
        {isLoggedIn ? (
          <>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-full"
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
            </button>
            {showUserMenu && (
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
          </>
        ) : (
          <GoogleLogin
            onSuccess={login}
            onError={handleGoogleSignInFailure}
            useOneTap
          />
        )}
      </div>
    );
  },
);

UserMenu.displayName = "UserMenu";

export default UserMenu;
