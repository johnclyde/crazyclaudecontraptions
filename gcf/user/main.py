from flask import Request, Response, jsonify
from google.cloud import firestore_v1

db = firestore_v1.Client(database="grindolympiads")

def load_user(request: Request) -> Response:
    headers = {"Access-Control-Allow-Origin": "*"}
    try:
        # Reference to the user document
        user_ref = db.collection('users').document('math1434')
        
        # Try to get the user document
        user_doc = user_ref.get()
        
        if user_doc.exists:
            # User exists, return the user data
            user_data = user_doc.to_dict()
        else:
            # User doesn't exist, create a new user
            new_user_data = {
                'username': 'math1434',
                'email': 'math1434@example.com',
                'created_at': firestore_v1.SERVER_TIMESTAMP,
                'tests_taken': [],
                'points': 0
            }
            
            # Set the new user data in Firestore
            user_ref.set(new_user_data)
            
            # Retrieve the newly created user data
            user_data = user_ref.get().to_dict()
        
        response_data = {
            "user": user_data
        }
        
        return jsonify(response_data), 200, headers
    except Exception as e:
        return jsonify({"error": str(e)}), 500, headers
