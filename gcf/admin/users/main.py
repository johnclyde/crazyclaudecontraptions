from flask import Request, Response, jsonify
from google.cloud import firestore_v1

db = firestore_v1.Client(database="grindolympiads")


def list_users(request: Request) -> Response:
    headers = {"Access-Control-Allow-Origin": "*"}

    try:
        users_ref = db.collection("users")
        users = users_ref.stream()

        user_list = []
        for user in users:
            user_data = user.to_dict()
            user_list.append(
                {
                    "id": user.id,
                    "name": user_data.get("name", "N/A"),
                    "email": user_data.get("email", "N/A"),
                    "role": user_data.get("role", "user"),
                    "isAdmin": user_data.get("isAdmin", False),
                    "isStaff": user_data.get("isStaff", False),
                    "createdAt": user_data.get("created_at", ""),
                    "lastLogin": user_data.get("last_login", ""),
                    "points": user_data.get("points", 0),
                }
            )

        return jsonify({"users": user_list}), 200, headers

    except Exception as e:
        return jsonify({"error": str(e)}), 500, headers
