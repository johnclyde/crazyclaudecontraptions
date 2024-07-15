import { useState, useEffect, useCallback } from "react";
import { useGoogleLogin } from "@react-oauth/google";

interface User {
  // Define user properties here
  // For example:
  id: string;
  name: string;
  email: string;
  // Add any other relevant user properties
}

interface UserProgress {
  // Define user progress properties here
  // For example:
  testId: string;
  score: number;
  completedAt: string;
  // Add any other relevant progress properties
}

const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const fetchUserData = useCallback(async () => {
    if (!token) return;

    try {
      const userResponse = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
            Authorization: `Bearer ${token}`,
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
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token, fetchUserData]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch(
          "https://us-central1-olympiads.cloudfunctions.net/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              google_token: tokenResponse.access_token,
            }),
          },
        );
        const data = await response.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          setIsLoggedIn(true);
          await fetchUserData();
        }
      } catch (error) {
        console.error("Error logging in:", error);
      }
    },
    onError: (error) => console.error("Login Failed:", error),
    scope: "email profile",
  });

  const logout = async () => {
    try {
      await fetch("https://us-central1-olympiads.cloudfunctions.net/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      setUserProgress([]);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return { user, isLoggedIn, login, logout, userProgress };
};

export default useUserData;
