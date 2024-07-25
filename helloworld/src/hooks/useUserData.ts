import { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { User, UserProgress } from "../types";

export type LoginFunction = () => Promise<void>;

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
    if (auth) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        // Call your login API
        const idToken = await firebaseUser.getIdToken();
        console.log("Calling login GCF...");
        const response = await fetch("api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Login function call failed");
        }

        const data = await response.json();
        console.log("Login function response:", data);

        // Update user data with API response
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "Anonymous",
          email: firebaseUser.email || "",
          avatar: firebaseUser.photoURL || "",
          isAdmin: data.user.isAdmin || false,
        };
        setUser(userData);
        setIsLoggedIn(true);

        // If the API returns user progress, update it
        if (data.userProgress) {
          setUserProgress(data.userProgress);
        }
      } catch (error) {
        console.error("Error signing in with Google", error);
      }
    } else {
      console.error("Firebase auth is not initialized");
    }
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
    login,
    logout,
    userProgress,
    isAdminMode,
    toggleAdminMode,
  };
};

export default useUserData;
