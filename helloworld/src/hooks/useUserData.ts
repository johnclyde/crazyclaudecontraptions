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
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const userData = await fetchUserData(token);
        setUser(userData);
        setIsLoggedIn(true);
        setUserProgress(userData.progress || []);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsAdminMode(false);
        setUserProgress([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (token: string): Promise<User> => {
    const response = await fetch("/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    return await response.json();
  };

  const login: LoginFunction = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const userData = await fetchUserData(token);
      setUser(userData);
      setIsLoggedIn(true);
      setUserProgress(userData.progress || []);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to logout on server");
      }

      await signOut(auth);
      setUser(null);
      setIsLoggedIn(false);
      setIsAdminMode(false);
      setUserProgress([]);
      navigate("/");
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
      progress: [],
    };
    setUser(bypassUser);
    setIsLoggedIn(true);
    setUserProgress([]);
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
    bypassLogin,
    userProgress,
    isAdminMode,
    toggleAdminMode,
  };
};

export default useUserData;
