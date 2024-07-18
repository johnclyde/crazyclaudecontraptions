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
  const [error, setError] = useState("");
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
    setError(null);
    try {
    if (auth) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error signing in with Google", error);
      }
    } else {
      console.error("Firebase auth is not initialized");
    }
      const user = result.user;

      // Call your login GCF here
      const idToken = await user.getIdToken();
      console.log("Calling login GCF...");
      const response = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login function call failed");
      }

      const data = await response.json();
      console.log("Login function response:", data);
      setUser(data.user);
    } catch (err) {
      setError(err.message);
      console.error("Login error:", error);
    if (auth) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {


  const logout = async () => {
    try {
      // Get the current user's ID token before signing out
      const currentUser = auth.currentUser;
      let idToken = null;
      if (currentUser) {
        idToken = await currentUser.getIdToken();
      }

      // Sign out from Firebase Authentication
      await signOut(auth);

      // Clear local user state
      setUser(null);
      setIsLoggedIn(false);

      // Call the logout endpoint if we have an ID token
      if (idToken) {
        console.log("Calling logout GCF...");
        const response = await fetch(
          "https://us-central1-olympiads.cloudfunctions.net/logout",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Logout function call failed");
        }

        const data = await response.json();
        console.log("Logout function response:", data);
      }
    } catch (err) {
      setError(err.message);
      console.error("Logout error:", err);
    }
  };

  return { user, isLoggedIn, setIsLoggedIn, login, logout, userProgress };
};

export default useUserData;
