import React, { forwardRef, useEffect, useState } from "react";
import GoogleAuth from "./GoogleAuth";

interface User {
  name: string;
  avatar: string;
}

interface UserMenuProps {
  user: User | null;
  isLoggedIn: boolean;
  showUserMenu: boolean;
  setShowUserMenu: React.Dispatch<React.SetStateAction<boolean>>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
  ({ user, isLoggedIn, showUserMenu, setShowUserMenu, login, logout }, ref) => {
    const [isGoogleAuthReady, setIsGoogleAuthReady] = useState(false);

    useEffect(() => {
      // Check if Google Auth is ready (e.g., client ID is set in environment variables)
      setIsGoogleAuthReady(!!process.env.REACT_APP_GOOGLE_CLIENT_ID);
    }, []);

    const handleProfileClick = () => {
      console.log("Navigate to profile");
      setShowUserMenu(false);
    };

    const handleSettingsClick = () => {
      console.log("Navigate to settings");
      setShowUserMenu(false);
    };

    const handleLogin = async () => {
      await login();
      setShowUserMenu(false);
    };

    const handleLogout = async () => {
      await logout();
      setShowUserMenu(false);
    };

    const handleGoogleSignInSuccess = (response: any) => {
      console.log("Google Sign-In Success", response);
      // Here you would typically send the response.credential to your backend
      // to verify and create a session for the user
      handleLogin();
    };

    const handleGoogleSignInFailure = (error: any) => {
      console.error("Google Sign-In Failure", error);
      // Handle sign-in failure (e.g., show an error message)
    };

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-full"
        >
          {isLoggedIn && user ? (
            <img
              src={user.avatar}
              alt={user.name}
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
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
            {isLoggedIn ? (
              <>
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
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Login
                </button>
                {isGoogleAuthReady && (
                  <div className="px-4 py-2">
                    <GoogleAuth
                      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
                      onSuccess={handleGoogleSignInSuccess}
                      onFailure={handleGoogleSignInFailure}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  },
);

UserMenu.displayName = "UserMenu";

export default UserMenu;
