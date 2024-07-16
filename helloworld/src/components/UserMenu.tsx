import React, { forwardRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { ChevronDown } from "lucide-react";

interface User {
  name: string;
  avatar: string;
}

interface UserMenuProps {
  user: User | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
  ({ user, isLoggedIn, login, logout }, ref) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = () => {
      setShowDropdown(!showDropdown);
    };

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full border-2 border-blue-500 hover:border-blue-600 transition-colors"
        >
          {isLoggedIn ? user?.avatar : "🥷"}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    console.log("Navigate to profile");
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    console.log("Navigate to settings");
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="px-4 py-2">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    login();
                    setShowDropdown(false);
                  }}
                  onError={() => {
                    console.log("Login Failed");
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

UserMenu.displayName = "UserMenu";

export default UserMenu;
