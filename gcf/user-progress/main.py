from flask import jsonify
from google.cloud import firestore_v1

db = firestore_v1.Client(database="grindolympiads")

def user_progress(request):
    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    # For this example, we'll use a hardcoded user ID
    # In a real application, you'd get this from the authenticated user's session
    user_id = 'math1434'

    try:
        # Get the user document
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404, headers

        user_data = user_doc.to_dict()

        # Get the user's completed tests
        completed_tests = user_data.get('tests_taken', [])

        # Prepare the progress data
        progress_data = []
        for test in completed_tests:
            progress_data.append({
                "competition": test['competition'],
                "year": test['year'],
                "exam": test['exam'],
                "score": test['score']
            })

        return jsonify(progress_data), 200, headers

    except Exception as e:
        return jsonify({"error": str(e)}), 500, headers
