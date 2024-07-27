import { useState, useEffect, useCallback } from "react";
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

  const clearUserData = useCallback(() => {
    setUser(null);
    setUserProgress([]);
    setIsLoggedIn(false);
    setIsAdminMode(false);
    navigate("/");
  }, [navigate]);

  const fetchUserProfile = useCallback(
    async (firebaseUser: FirebaseUser) => {
      try {
        const idToken = await firebaseUser.getIdToken();
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await response.json();

        const userData: User = {
          id: firebaseUser.uid,
          name: profileData.name,
          email: profileData.email,
          avatar: profileData.avatar,
          isAdmin: profileData.isAdmin,
          isStaff: profileData.isStaff,
          createdAt: profileData.createdAt,
          lastLogin: profileData.lastLogin,
          points: profileData.points,
          role: profileData.role,
          progress: profileData.progress,
        };

        setUser(userData);
        setIsLoggedIn(true);
        setUserProgress(profileData.testsTaken || []);
        setIsAdminMode(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        clearUserData();
      }
    },
    [clearUserData],
  );

  useEffect(() => {
    if (auth && typeof auth.onAuthStateChanged === "function") {
      const unsubscribe = auth.onAuthStateChanged(
        (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            fetchUserProfile(firebaseUser);
          } else {
            clearUserData();
          }
        },
      );

      return () => unsubscribe();
    } else {
      console.error("Firebase auth is not initialized correctly");
    }
  }, [clearUserData, fetchUserProfile]);

  const login: LoginFunction = async () => {
    if (auth) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        await fetchUserProfile(result.user);
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
        const response = await fetch("/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Logout API call failed");
        }

        clearUserData();
      } catch (error) {
        console.error("Error during logout:", error);
      }
    } else {
      console.error("Firebase auth is not initialized");
    }
  };

  const bypassLogin = () => {
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
    setUserProgress([]);
    setIsAdminMode(false);
  };

  const toggleAdminMode = useCallback(() => {
    if (user?.isAdmin) {
      setIsAdminMode((prevMode) => !prevMode);
    }
  }, [user]);

  return {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    login,
    logout,
    bypassLogin,
    userProgress,
    isAdminMode,
    toggleAdminMode,
  };
};

export default useUserData;
