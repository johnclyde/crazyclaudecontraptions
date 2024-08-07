import { useState, useCallback } from "react";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { User, UserProgress } from "../types";

export type LoginFunction = () => Promise<void>;

const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  const clearUserData = useCallback(() => {
    setUser(null);
    setUserProgress([]);
    setIsLoggedIn(false);
  }, []);

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
          progress: profileData.progress || [],
        };

        setUser(userData);
        setIsLoggedIn(true);
        setUserProgress(profileData.progress || []);
        return userData;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        clearUserData();
        throw error;
      }
    },
    [clearUserData],
  );

  const login: LoginFunction = async () => {
    if (auth) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        // Backend login
        const loginResponse = await fetch("/api/login", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!loginResponse.ok) {
          throw new Error("Backend login failed");
        }

        // After successful login, fetch user profile
        await fetchUserProfile(result.user);
      } catch (error) {
        console.error("Error during login process:", error);
        clearUserData();
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

  return {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    login,
    logout,
    fetchUserProfile,
    userProgress,
  };
};

export default useUserData;
