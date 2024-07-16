from flask import Request, Response, jsonify
from google.cloud import firestore_v1
from firebase_admin import firestore

db = firestore.Client()


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
                }
            )

        return jsonify({"users": user_list}), 200, headers

    except Exception as e:
        return jsonify({"error": str(e)}), 500, headers
