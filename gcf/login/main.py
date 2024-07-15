import datetime

import jwt
from flask import Request, Response, jsonify
from google.auth.transport import requests
from google.cloud import firestore_v1
from google.oauth2 import id_token

db = firestore_v1.Client(database="grindolympiads")
SECRET_KEY = (
    "a_secure_random_secret_key"  # Consider using a more secure method to store this
)


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
        google_token = request_json.get("google_token")

        if not google_token:
            return jsonify({"error": "No Google token provided"}), 400, headers

        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(google_token, requests.Request())

        # Get user info from the token
        google_id = idinfo["sub"]
        email = idinfo["email"]
        name = idinfo.get("name", email)

        # Check if user exists, if not create a new one
        user_ref = db.collection("users").document(google_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            # Create new user
            new_user = {
                "email": email,
                "name": name,
                "created_at": datetime.datetime.now(),
                "last_login": datetime.datetime.now(),
            }
            user_ref.set(new_user)
        else:
            # Update last login
            user_ref.update({"last_login": datetime.datetime.now()})

        # Create JWT token
        token = jwt.encode(
            {
                "user_id": google_id,
                "email": email,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            },
            SECRET_KEY,
            algorithm="HS256",
        )

        return (
            jsonify(
                {"message": "Login successful", "token": token, "user_id": google_id}
            ),
            200,
            headers,
        )

    except ValueError as e:
        # Invalid token
        return jsonify({"error": str(e)}), 401, headers
    except Exception as e:
        return jsonify({"error": str(e)}), 500, headers
