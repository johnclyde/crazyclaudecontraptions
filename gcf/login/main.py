import datetime

import jwt
from flask import Request, Response, jsonify
from google.cloud import firestore_v1

db = firestore_v1.Client(database="grindolympiads")
SECRET_KEY = "a_secure_random_secret_key"


def login(request: Request) -> Response:
    headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    }
    if request.method == "OPTIONS":
        return Response(status=204, headers=headers)

    try:
        request_json = request.get_json()
        username = request_json.get("username")

        user_ref = db.collection("users").document(username)
        user_doc = user_ref.get()

        if user_doc.exists:
            # We are not using passwords. I hate passwords.
            user_data = user_doc.to_dict()
            user_ref.update({"last_login": datetime.datetime.now()})
            token = jwt.encode(
                {
                    "username": username,
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
                },
                SECRET_KEY,
                algorithm="HS256",
            )
            return (
                jsonify({"message": "Login successful", "token": token}),
                200,
                headers,
            )
        else:
            return jsonify({"error": "User not found"}), 404, headers

    except Exception as e:
        return jsonify({"error": str(e)}), 500, headers
