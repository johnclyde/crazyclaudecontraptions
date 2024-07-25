import { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
}

interface UserProgress {
  testId: string;
  score: number;
  completedAt: string;
}

export type LoginFunction = () => void;

const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth && typeof auth.onAuthStateChanged === "function") {
      const unsubscribe = auth.onAuthStateChanged(
        (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            // We'll update the user data after the API call
            setIsLoggedIn(true);
          } else {
            setUser(null);
            setIsLoggedIn(false);
            setIsAdminMode(false);
            navigate("/");
          }
        },
      );

      return () => unsubscribe();
    } else {
      console.error("Firebase auth is not initialized correctly");
    }
  }, [navigate]);

  const login: LoginFunction = async () => {
    // ... (login logic remains the same)
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);

        // Call your custom logout API
        const response = await fetch("/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Logout API call failed");
        }

        // Clear user data and update state
        setUser(null);
        setIsLoggedIn(false);
        setUserProgress([]);
        setIsAdminMode(false);
        navigate("/");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    } else {
      console.error("Firebase auth is not initialized");
    }
  };

  const toggleAdminMode = () => {
    if (user?.isAdmin) {
      setIsAdminMode(!isAdminMode);
    }
  };

  return {
    user,
    isLoggedIn,
    setIsLoggedIn,
    login,
    logout,
    userProgress,
    isAdminMode,
    toggleAdminMode,
  };
};

export default useUserData;
