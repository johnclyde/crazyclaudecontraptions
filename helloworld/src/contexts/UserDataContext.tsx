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
import { auth } from "../firebase";

export interface UserDataContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: LoginFunction;
  logout: () => Promise<void>;
  userProgress: UserProgress[];
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  bypassLogin: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    login,
    logout,
    fetchUserProfile,
    userProgress,
  } = useUserData();
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const storedAdminMode = localStorage.getItem("isAdminMode");
    if (storedAdminMode) {
      setIsAdminMode(JSON.parse(storedAdminMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isAdminMode", JSON.stringify(isAdminMode));
  }, [isAdminMode]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (auth) {
      unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            await userData.fetchUserProfile(firebaseUser);
    if (auth && typeof auth.onAuthStateChanged === "function") {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            await fetchUserProfile(firebaseUser);
          } catch (error) {
            console.error("Error during auto-login:", error);
          }
        } else {
          userData.setUser(null);
          userData.setIsLoggedIn(false);
          setIsAdminMode(false);
        }
      });
    } else {
      console.error("Firebase auth is not initialized correctly");
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData]);
          setUser(null);
          setIsLoggedIn(false);
        }
      });

      return () => unsubscribe();
    } else {
      console.error("Firebase auth is not initialized correctly");
    }
  }, [fetchUserProfile, setUser, setIsLoggedIn]);

  const toggleAdminMode = useCallback(() => {
    setIsAdminMode((prevMode) => {
      if (user?.isAdmin) {
        return !prevMode;
      }
      return prevMode;
    });
  }, [user]);

  const logout = useCallback(async () => {
    setIsAdminMode(false);
    await userData.logout();
  }, [userData]);
  const bypassLogin = useCallback(() => {
    const bypassUser: User = {
      id: "math1434",
      name: "Math User",
      email: "math1434@example.com",
      avatar: "",
      isAdmin: false,
      isStaff: false,
      createdAt: "0",
      lastLogin: "0",
      points: 1434,
      role: "User",
      progress: [],
    };
    setUser(bypassUser);
    setIsLoggedIn(true);
  }, [setUser, setIsLoggedIn]);

  const contextValue: UserDataContextType = {
    user,
    isLoggedIn,
    login,
    logout,
    userProgress,
    isAdminMode,
    toggleAdminMode,
    bypassLogin,
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

export default UserDataContext;
