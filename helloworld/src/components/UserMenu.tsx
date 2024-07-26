import React, { forwardRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { LoginFunction } from "../hooks/useUserData";
import { Link } from "react-router-dom";
import { User } from "../types";

interface UserMenuProps {
  user: User | null;
  isLoggedIn: boolean;
  login: LoginFunction;
  logout: () => void;
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  stagingLogin?: () => void;
}

const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
  (
    {
      user,
      isLoggedIn,
      login,
      logout,
      isAdminMode,
      toggleAdminMode,
      stagingLogin,
    },
    ref,
  ) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const handleSettingsClick = () => {
      console.log("Navigate to settings");
      setShowMenu(false);
    };

    const handleLogout = () => {
      logout();
      setShowMenu(false);
    };

    const handleLoginClick = () => {
      setShowLoginDialog(true);
      setShowMenu(false);
    };

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-full"
        >
          {isLoggedIn ? (
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt={user?.name || "User"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMenu(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleSettingsClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <Link
                  to="/users"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMenu(false)}
                >
                  Users
                </Link>
                {user?.isAdmin && (
                  <button
                    onClick={() => {
                      toggleAdminMode();
                      setShowMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {isAdminMode ? "Disable Admin Mode" : "Enable Admin Mode"}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Login
                </button>
                {stagingLogin && (
                  <button
                    onClick={() => {
                      stagingLogin();
                      setShowMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Log in as math1434
                  </button>
                )}
              </>
            )}
          </div>
        )}
        {showLoginDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Login</h2>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  login();
                  setShowLoginDialog(false);
                }}
                onError={() => {
                  console.log("Login Failed");
                  setShowLoginDialog(false);
                }}
              />
              <button
                onClick={() => setShowLoginDialog(false)}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

UserMenu.displayName = "UserMenu";

export default UserMenu;
