import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";

interface FirestoreUser {
  email: string;
  name: string;
  created_at: string;
  last_login: string;
}

export const useLogin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Call your login GCF here
      const idToken = await user.getIdToken();
      console.log("Calling login GCF...");
      const response = await fetch(
        "/api/login",
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
      setFirestoreUser(data.user);
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    }
  };

  const logout = async () => {
    await auth.signOut();
    setFirestoreUser(null);
  };

  return { user, firestoreUser, loading, error, login, logout };
};
