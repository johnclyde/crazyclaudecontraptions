import { useState, useEffect, useCallback } from "react";
import {
  useGoogleLogin,
  CredentialResponse,
  LoginFunction,
} from "@react-oauth/google";

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

type LoginFunction = (() => void) | ((response: CredentialResponse) => void);

const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const fetchUserData = useCallback(async () => {
    // ... (rest of the fetchUserData function remains the same)
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token, fetchUserData]);

  const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
    try {
      const tokenResponse = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            google_token: response.credential,
          }),
        },
      );
      const data = await tokenResponse.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        await fetchUserData();
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const login: LoginFunction = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: (error) => console.error("Login Failed:", error),
  });

  const logout = async () => {
    // ... (logout function remains the same)
  };

  return { user, isLoggedIn, login, logout, userProgress };
};

export { LoginFunction };
export default useUserData;
