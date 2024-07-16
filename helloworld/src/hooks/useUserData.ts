import { useState, useEffect, useCallback } from "react";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface UserProgress {
  testId: string;
  score: number;
  completedAt: string;
}

export type LoginFunction = () => Promise<void>;

const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const fetchUserData = useCallback(async (idToken: string) => {
    try {
      const userResponse = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/user",
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await userResponse.json();
      setUser(userData.user);
      setIsLoggedIn(true);

      const progressResponse = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/user_progress",
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );
      if (!progressResponse.ok) {
        throw new Error("Failed to fetch user progress");
      }
      const progressData = await progressResponse.json();
      setUserProgress(progressData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoggedIn(false);
      localStorage.removeItem("token");
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          localStorage.setItem("token", idToken);
          await fetchUserData(idToken);
        } else {
          setUser(null);
          setIsLoggedIn(false);
          setUserProgress([]);
          localStorage.removeItem("token");
          setToken(null);
        }
      },
    );

    return () => unsubscribe();
  }, [fetchUserData]);

  const login: LoginFunction = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await fetch("https://us-central1-olympiads.cloudfunctions.net/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return { user, isLoggedIn, login, logout, userProgress };
};

export default useUserData;
