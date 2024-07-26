import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { User, UserProgress } from "../types";

export type LoginFunction = () => Promise<void>;

const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isBypassLogin, setIsBypassLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: () => void;
    if (auth && typeof auth.onAuthStateChanged === "function") {
      unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          const userData = await fetchUserData(token);
          setUser(userData);
          setIsLoggedIn(true);
          setUserProgress(userData.progress || []);
          setIsBypassLogin(false);
        } else if (!isBypassLogin) {
          setUser(null);
          setIsLoggedIn(false);
          setIsAdminMode(false);
          setUserProgress([]);
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isBypassLogin]);

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
    if (auth) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const token = await result.user.getIdToken();
        const userData = await fetchUserData(token);
        setUser(userData);
        setIsLoggedIn(true);
        setUserProgress(userData.progress || []);
        setIsBypassLogin(false);
      } catch (error) {
        console.error("Error signing in with Google", error);
      }
    } else {
      console.error("Firebase auth is not initialized");
    }
  };

  const logout = async () => {
    if (auth && !isBypassLogin) {
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
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }

    setUser(null);
    setIsLoggedIn(false);
    setIsAdminMode(false);
    setUserProgress([]);
    setIsBypassLogin(false);
    navigate("/");
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
    setIsBypassLogin(true);
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
    bypassLogin,
    userProgress,
    isAdminMode,
    toggleAdminMode,
    isBypassLogin,
  };
};

export default useUserData;
