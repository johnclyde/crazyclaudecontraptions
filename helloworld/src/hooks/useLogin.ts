import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";

export const useLogin = () => {
  const [user, setUser] = useState<User | null>(null);
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
      const response = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ uid: user.uid, email: user.email }),
        },
      );

      if (!response.ok) {
        throw new Error("Login function call failed");
      }

      const data = await response.json();
      console.log("Login function response:", data);
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    }
  };

  const logout = () => auth.signOut();

  return { user, loading, error, login, logout };
};
