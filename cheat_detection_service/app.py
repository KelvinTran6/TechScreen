from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from cheat_detector import CheatDetector

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the cheat detector
cheat_detector = CheatDetector()

@app.route('/check-code', methods=['POST'])
def check_code():
    """
    Endpoint to check if the candidate's code might be cheating.
    """
    data = request.json
    print("Received data:")
    print(data)
    
    # Extract data from request
    problem_statement = data.get('problem_statement', '')
    candidate_code = data.get('candidate_code', '')
    language = data.get('language', '')
    
    # Check for cheating
    result = cheat_detector.check_code(problem_statement, candidate_code, language)
    
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint to verify the service is running.
    """
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 