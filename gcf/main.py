from google.cloud import firestore_v1
from flask import jsonify

app = Flask(__name__)
db = firestore_v1.Client(database="grindolympiads")

@app.route('/exam-data/competition/', methods=['GET'])
@app.route('/exam-data/competition/<competition>/<year>/<exam>', methods=['GET'])
def get_exam_data(competition=None, year=None, exam=None):
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

    if not all([competition, year, exam]):
        return (jsonify({'error': 'Missing parameters'}), 400, headers)

    try:
        # Fetch problems
        problems_ref = (
            db.collection(competition)
            .document(year)
            .collection(exam)
            .document("Problems")
            .collection("Problems")
        )
        problems = problems_ref.order_by("number").stream()
        problems_list = [{"problem_id": doc.id, **doc.to_dict()} for doc in problems]

        # Fetch comment
        test_comment_ref = (
            db.collection(competition).document(year).collection(exam).document("Comment")
        )
        test_comment_doc = test_comment_ref.get()
        test_comment = (
            test_comment_doc.to_dict().get("comment", "") if test_comment_doc.exists else ""
        )

        # Prepare response
        response_data = {
            'problems': problems_list,
            'comment': test_comment,
            'competition': competition,
            'year': year,
            'exam': exam
        }

        return (jsonify(response_data), 200, headers)

    except Exception as e:
        return (jsonify({'error': str(e)}), 500, headers)
