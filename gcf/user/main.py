from flask import Request, Response, jsonify
from google.cloud import firestore_v1

db = firestore_v1.Client(database="grindolympiads")


def load_user(request: Request) -> Response:
    headers = {"Access-Control-Allow-Origin": "*"}
    try:
        user_ref = db.collection("users").document("math1434")
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            response_data = {"user": user_data}
            return jsonify(response_data), 200, headers
        else:
            return jsonify({"error": "User not found"}), 404, headers

    except Exception as e:
        return jsonify({"error": str(e)}), 500, headers
