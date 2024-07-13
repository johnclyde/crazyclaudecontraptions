from datetime import datetime, timedelta

from flask import jsonify
from google.cloud import firestore_v1

db = firestore_v1.Client(database="grindolympiads")


def user_notifications(request):
    # Set CORS headers for the preflight request
    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)

    # Set CORS headers for the main request
    headers = {"Access-Control-Allow-Origin": "*"}

    # For this example, we'll use a hardcoded user ID
    # In a real application, you'd get this from the authenticated user's session
    user_id = "math1434"

    try:
        # Get the user document
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404, headers

        user_data = user_doc.to_dict()

        # Get the user's notifications
        notifications_ref = user_ref.collection("notifications")
        notifications = (
            notifications_ref.order_by(
                "timestamp", direction=firestore_v1.Query.DESCENDING
            )
            .limit(10)
            .stream()
        )

        # Prepare the notifications data
        notifications_data = []
        for notification in notifications:
            notification_data = notification.to_dict()
            notifications_data.append(
                {
                    "id": notification.id,
                    "message": notification_data["message"],
                    "read": notification_data["read"],
                    "timestamp": notification_data["timestamp"].isoformat(),
                }
            )

        # Generate new notifications based on user activity
        last_login = user_data.get("last_login", datetime.now() - timedelta(days=30))
        if (datetime.now() - last_login).days >= 7:
            new_notification = {
                "message": "Welcome back! It's been a while since your last visit.",
                "read": False,
                "timestamp": firestore_v1.SERVER_TIMESTAMP,
            }
            notifications_ref.add(new_notification)
            notifications_data.insert(
                0,
                {
                    "id": "new",
                    "message": new_notification["message"],
                    "read": new_notification["read"],
                    "timestamp": datetime.now().isoformat(),
                },
            )

        # Update user's last login time
        user_ref.update({"last_login": firestore_v1.SERVER_TIMESTAMP})

        return jsonify(notifications_data), 200, headers

    except Exception as e:
        return jsonify({"error": str(e)}), 500, headers
