import { useState, useEffect } from "react";
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

export type LoginFunction = () => void;

const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // eslint-disable-next-line
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    if (auth && typeof auth.onAuthStateChanged === "function") {
      const unsubscribe = auth.onAuthStateChanged(
        (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            const userData: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "Anonymous",
              email: firebaseUser.email || "",
              avatar: firebaseUser.photoURL || "",
            };
            setUser(userData);
            setIsLoggedIn(true);
          } else {
            setUser(null);
            setIsLoggedIn(false);
          }
        },
      );

      return () => unsubscribe();
    } else {
      console.error("Firebase auth is not initialized correctly");
    }
  }, []);

  const login: LoginFunction = async () => {
    if (auth) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
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
        const response = await fetch('/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Logout API call failed');
        }

        // Clear user data and update state
        setUser(null);
        setIsLoggedIn(false);
      } catch (error) {
        console.error("Error during logout:", error);
      }
    } else {
      console.error("Firebase auth is not initialized");
    }
  };

  return { user, isLoggedIn, setIsLoggedIn, login, logout, userProgress };
};

export default useUserData;
