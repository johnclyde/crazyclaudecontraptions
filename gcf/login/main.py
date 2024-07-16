import datetime

import firebase_admin
from firebase_admin import auth, credentials, firestore
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

db = firestore.client(database="grindolympiads")


def login(request: Request) -> Response:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
    }
    if request.method == "OPTIONS":
        return Response(status=204, headers=headers)

    try:
        if "Authorization" not in request.headers:
            raise ValueError("No Authorization header present")

        id_token = request.headers.get("Authorization", "").split("Bearer ").pop()

        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]

        # Get user data from Firestore
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if user_doc.exists:
            # Update existing user
            user_data = user_doc.to_dict()
            user_data["last_login"] = datetime.datetime.now()
            user_ref.update(user_data)
        else:
            # Create new user
            firebase_user = auth.get_user(uid)
            user_data = {
                "email": firebase_user.email,
                "name": firebase_user.display_name or firebase_user.email,
                "created_at": datetime.datetime.now(),
                "last_login": datetime.datetime.now(),
            }
            user_ref.set(user_data)

        return jsonify({"message": "Login successful", "user": user_data}), 200, headers

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400, headers
    except auth.InvalidIdTokenError:
        return jsonify({"error": "Invalid ID token"}), 401, headers
    except auth.ExpiredIdTokenError:
        return jsonify({"error": "Expired ID token"}), 401, headers
    except auth.RevokedIdTokenError:
        return jsonify({"error": "Revoked ID token"}), 401, headers
    except auth.UserNotFoundError:
        return jsonify({"error": "User not found"}), 404, headers
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500, headers
