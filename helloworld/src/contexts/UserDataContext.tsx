import React, { createContext, useContext, ReactNode } from "react";
import useUserData from "../hooks/useUserData";

interface UserDataContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
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
  return (
    <UserDataContext.Provider value={userData}>
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
