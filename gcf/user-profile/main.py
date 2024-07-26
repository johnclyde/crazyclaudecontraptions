import firebase_admin
from firebase_admin import auth, credentials
from flask import Request, Response, jsonify
from google.cloud import firestore_v1

# Initialize Firebase Admin SDK if not already initialized
if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(
        cred,
        {
            "projectId": "olympiads",
        },
    )

db = firestore_v1.Client(database="grindolympiads")


def user_profile(request: Request) -> Response:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
    }
    if request.method == "OPTIONS":
        return Response(status=204, headers=headers)

    try:
        # Verify the ID token
        if "Authorization" not in request.headers:
            raise ValueError("No Authorization header present")

        id_token = request.headers.get("Authorization", "").split("Bearer ").pop()
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]

        # Get user data from Firestore
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404, headers

        user_data = user_doc.to_dict()

        # Fetch additional user data
        progress_ref = user_ref.collection("progress")
        progress_docs = progress_ref.stream()
        tests_taken = [doc.to_dict()["testId"] for doc in progress_docs]

        # Prepare the response
        profile_data = {
            "name": user_data.get("name", ""),
            "email": user_data.get("email", ""),
            "avatar": user_data.get("avatar", ""),
            "role": user_data.get("role", "user"),
            "isAdmin": user_data.get("isAdmin", False),
            "isStaff": user_data.get("isStaff", False),
            "createdAt": user_data.get("created_at", ""),
            "lastLogin": user_data.get("last_login", ""),
            "points": user_data.get("points", 0),
            "testsTaken": tests_taken,
        }

        return jsonify(profile_data), 200, headers

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400, headers
    except auth.InvalidIdTokenError:
        return jsonify({"error": "Invalid ID token"}), 401, headers
    except auth.ExpiredIdTokenError:
        return jsonify({"error": "Expired ID token"}), 401, headers
    except auth.RevokedIdTokenError:
        return jsonify({"error": "Revoked ID token"}), 401, headers
    except Exception as e:
        return (
            jsonify({"error": f"An unexpected error occurred: {str(e)}"}),
            500,
            headers,
        )
