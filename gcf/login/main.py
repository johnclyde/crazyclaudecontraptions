import datetime

import firebase_admin
from firebase_admin import auth, credentials
from flask import Request, Response, jsonify

# Initialize Firebase app if it hasn't been initialized yet
if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(
        cred,
        {
            "projectId": "olympiads",
        },
    )


def login(request: Request) -> Response:
    print("Login function called")
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
    }
    if request.method == "OPTIONS":
        return Response(status=204, headers=headers)

    try:
        print(f"Request method: {request.method}")
        print(f"Request headers: {request.headers}")

        # Check if Authorization header is present
        if "Authorization" not in request.headers:
            raise ValueError("No Authorization header present")

        id_token = request.headers.get("Authorization", "").split("Bearer ").pop()
        print(
            f"ID Token received: {id_token[:10]}..."
        )  # Print first 10 chars of token for logging

        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        print(f"Authenticated UID: {uid}")

        # Update user's last login time
        auth.update_user(uid, {"lastLoginAt": datetime.datetime.now().isoformat()})

        # Fetch user details
        user = auth.get_user(uid)
        user_data = {
            "uid": user.uid,
            "email": user.email,
            "displayName": user.display_name,
            "lastLoginAt": user.user_metadata.last_sign_in_timestamp,
        }

        return jsonify({"message": "Login successful", "user": user_data}), 200, headers

    except ValueError as ve:
        print(f"ValueError in login: {str(ve)}")
        return jsonify({"error": str(ve)}), 400, headers
    except auth.InvalidIdTokenError:
        print("Invalid ID token")
        return jsonify({"error": "Invalid ID token"}), 401, headers
    except auth.ExpiredIdTokenError:
        print("Expired ID token")
        return jsonify({"error": "Expired ID token"}), 401, headers
    except auth.RevokedIdTokenError:
        print("Revoked ID token")
        return jsonify({"error": "Revoked ID token"}), 401, headers
    except auth.UserNotFoundError:
        print("User not found")
        return jsonify({"error": "User not found"}), 404, headers
    except Exception as e:
        print(f"Unexpected error in login: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500, headers
