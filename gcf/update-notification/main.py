from flask import jsonify, request
from google.cloud import firestore_v1

db = firestore_v1.Client(database="grindolympiads")


def mark_notification_read(request):
    # Set CORS headers for the preflight request
    if request.method == "OPTIONS":
        # Allows POST requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)

    # Set CORS headers for the main request
    headers = {"Access-Control-Allow-Origin": "*"}

    # For this example, we'll use a hardcoded user ID
    # In a real application, you'd get this from the authenticated user's session
    user_id = "math1434"

    # Get the notification ID from the request
    data = request.get_json()
    notification_id = data.get("notification_id")

    if not notification_id:
        return jsonify({"error": "Notification ID is required"}), 400, headers

    try:
        # Get the user document
        user_ref = db.collection("users").document(user_id)

        # Get the specific notification
        notification_ref = user_ref.collection("notifications").document(
            notification_id
        )

        # Update the notification to mark it as read
        notification_ref.update({"read": True})

        return (
            jsonify({"success": True, "message": "Notification marked as read"}),
            200,
            headers,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500, headers
