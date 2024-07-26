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
    const unsubscribe = auth.onAuthStateChanged(
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            const userData = await fetchUserData(firebaseUser);
            setUser(userData);
            setIsLoggedIn(true);
            setUserProgress(userData.progress || []);
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(null);
            setIsLoggedIn(false);
          }
        } else {
          setUser(null);
          setIsLoggedIn(false);
          setIsAdminMode(false);
          setUserProgress([]);
        }
      },
    );

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    const idToken = await firebaseUser.getIdToken();
    const response = await fetch("/api/user", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const userData = await response.json();
    return {
      id: firebaseUser.uid,
      name: userData.name || firebaseUser.displayName || "Anonymous",
      email: userData.email || firebaseUser.email || "",
      avatar: userData.avatar || firebaseUser.photoURL || "",
      isAdmin: userData.isAdmin || false,
      progress: userData.progress || [],
    };
  };

  const login: LoginFunction = async () => {
    if (auth) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const userData = await fetchUserData(result.user);
        setUser(userData);
        setIsLoggedIn(true);
        setUserProgress(userData.progress || []);
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
        });
        if (!response.ok) {
          console.error("Logout API call failed");
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
    setUser(null);
    setIsLoggedIn(false);
    setIsAdminMode(false);
    setUserProgress([]);
    navigate("/");
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
