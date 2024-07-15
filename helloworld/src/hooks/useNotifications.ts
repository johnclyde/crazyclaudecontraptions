import { useState, useEffect } from "react";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/notifications",
      );
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
    try {
      const response = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/mark_notification_read",
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
