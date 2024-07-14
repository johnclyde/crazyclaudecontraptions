import { useState, useEffect } from "react";

const useUserData = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProgress, setUserProgress] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userResponse = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/user",
      );
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await userResponse.json();
      setUser(userData.user);
      setIsLoggedIn(true);

      const progressResponse = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/user_progress",
      );
      if (!progressResponse.ok) {
        throw new Error("Failed to fetch user progress");
      }
      const progressData = await progressResponse.json();
      setUserProgress(progressData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoggedIn(false);
    }
  };

  const login = async () => {
    try {
      const response = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "math1434",
          }),
        },
      );
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        fetchUserData(); // Fetch user data after successful login
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const logout = async () => {
    try {
      await fetch("https://us-central1-olympiads.cloudfunctions.net/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      localStorage.removeItem("token");
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
