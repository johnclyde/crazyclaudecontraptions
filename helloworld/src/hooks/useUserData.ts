import { useState, useEffect } from "react";
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

interface UserProgress {
  testId: string;
  score: number;
  completedAt: string;
}

export type LoginFunction = () => void;

const useUserData = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // eslint-disable-next-line
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const userData: FirebaseUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Anonymous',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || '',
        };
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login: LoginFunction = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return { user, isLoggedIn, setIsLoggedIn, login, logout, userProgress };
};

export default useUserData;
