import datetime

import firebase_admin
from firebase_admin import auth, credentials
from flask import Request, Response, jsonify

cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(
    cred,
    {
        "projectId": "olympiads",
    },
)


def login(request: Request) -> Response:
    print("Login function called")  # Add this line for logging
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
    }
    if request.method == "OPTIONS":
        return Response(status=204, headers=headers)

    try:
        print("Request received:", request)  # Add this line for logging
        id_token = request.headers.get("Authorization", "").split("Bearer ").pop()
        print(
            "ID Token:", id_token[:10] + "..."
        )  # Print first 10 chars of token for logging

        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        print(f"Authenticated UID: {uid}")  # Add this line for logging

        # Update user's last login time
        auth.update_user(uid, {"lastLoginAt": datetime.datetime.now().isoformat()})

        return jsonify({"message": "Login successful", "uid": uid}), 200, headers
    except Exception as e:
        print(f"Login error: {str(e)}")  # Add this line for logging
        return jsonify({"error": str(e)}), 401, headers
