import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import useUserData, { LoginFunction } from "../hooks/useUserData";
import { User, UserProgress } from "../types";

interface UserDataContextType {
  user: User | null;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  login: LoginFunction;
  logout: () => Promise<void>;
  userProgress: UserProgress[];
  isAdminMode: boolean;
  toggleAdminMode: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const userData = useUserData();
  const [isAdminMode, setIsAdminMode] = useState(() => {
    const storedAdminMode = localStorage.getItem("isAdminMode");
    return storedAdminMode ? JSON.parse(storedAdminMode) : false;
  });

  useEffect(() => {
    localStorage.setItem("isAdminMode", JSON.stringify(isAdminMode));
  }, [isAdminMode]);

  const toggleAdminMode = useCallback(() => {
    if (userData.user?.isAdmin) {
      setIsAdminMode((prevMode) => !prevMode);
    }
  }, [userData.user]);

  const logout = useCallback(async () => {
    await userData.logout();
    setIsAdminMode(false);
    localStorage.removeItem("isAdminMode");
  }, [userData.logout]);

  const contextValue = {
    ...userData,
    isAdminMode,
    toggleAdminMode,
    logout,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserDataContext = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error(
      "useUserDataContext must be used within a UserDataProvider",
    );
  }
  return context;
};
