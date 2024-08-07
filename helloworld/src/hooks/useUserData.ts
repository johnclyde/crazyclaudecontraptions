import { useState, useCallback } from "react";
import { auth as firebaseAuth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  Auth,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { User, UserProgress } from "../types";

export type LoginFunction = () => Promise<void>;

const useUserData = (
  auth: Auth = firebaseAuth,
  signInWithPopupFn = signInWithPopup,
) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const navigate = useNavigate();

  const clearUserData = useCallback(() => {
    setUser(null);
    setUserProgress([]);
    setIsLoggedIn(false);
    localStorage.removeItem("isAdminMode");
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
          progress: profileData.progress || [],
        };

        setUser(userData);
        setIsLoggedIn(true);
        setUserProgress(profileData.user.progress || []);
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
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopupFn(auth, provider);
      if (result.user) {
        const idToken = await result.user.getIdToken();
      try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          const idToken = await result.user.getIdToken();

          // Call the login API endpoint
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

          // After successful login, fetch the user profile
          await fetchUserProfile(result.user);
        } else {
          throw new Error("No user returned from Firebase");
        }
      } catch (error) {
        console.error("Error during login process:", error);
        clearUserData();
      }
    } else {
      console.error("Firebase auth is not initialized");
    }
  };

        // Call the login API endpoint
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

        // After successful login, fetch the user profile
        await fetchUserProfile(result.user);
      } else {
        throw new Error("No user returned from Firebase");
      }
    } catch (error) {
      console.error("Error during login process:", error);
      clearUserData();
    }
  };

  const logout = async () => {
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
  };

  return {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    login,
    logout,
    bypassLogin,
    fetchUserProfile,
    userProgress,
  };
};

export default useUserData;
