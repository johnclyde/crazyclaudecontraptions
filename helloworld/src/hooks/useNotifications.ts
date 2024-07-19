import { useState, useEffect } from "react";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const useNotifications = (isLoggedIn: boolean) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setNotificationsError(null);
    }
  }, [isLoggedIn]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("api/notifications");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotificationsError(
        "Unable to load notifications. Please try again later.",
      );
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch(
        "/api/notification/read",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notification_id: notificationId }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return { notifications, notificationsError, markNotificationAsRead };
};

export default useNotifications;
