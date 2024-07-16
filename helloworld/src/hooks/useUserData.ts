import { useState, useEffect } from "react";
import { auth } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
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

  const login = async () => {
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

  return { user, isLoggedIn, login, logout };
};

export default useUserData;
