"""
PrepPilot AI – Smart Exam Preparation & Scheduler
Flask Backend Application for local Windows / XAMPP deployment
"""

import os
import json
import math
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ---------------------------------------------------------
# Modular In-Memory / SQL DB Adapter
# When running under XAMPP MySQL, SQLAlchemy models map here.
# ---------------------------------------------------------
LOCAL_DB_FILE = os.path.join(os.path.dirname(__file__), 'prep_pilot_db.json')

def load_data():
    if os.path.exists(LOCAL_DB_FILE):
        with open(LOCAL_DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        'users': [],
        'exams': [],
        'studyMaterials': [],
        'questionPapers': [],
        'testAttempts': [],
        'scheduleTasks': [],
        'studySessions': [],
        'aiRecommendations': []
    }

def save_data(data):
    with open(LOCAL_DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ---------------------------------------------------------
# API Endpoints matching frontend specification
# ---------------------------------------------------------

@app.route('/api/system/stats', methods=['GET'])
def system_stats():
    data = load_data()
    return jsonify({
        'status': 'online',
        'platform': 'PrepPilot AI Flask Suite',
        'counts': {
            'users': len(data.get('users', [])),
            'exams': len(data.get('exams', [])),
            'papers': len(data.get('questionPapers', [])),
            'attempts': len(data.get('testAttempts', []))
        },
        'geminiConfigured': bool(app.config.get('GEMINI_API_KEY'))
    })

@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    db_data = load_data()
    user = next((u for u in db_data['users'] if u['email'].lower() == email), None)
    
    if not user:
        # Auto-create for demo ease
        user = {
            'id': f"usr_{int(datetime.now().timestamp())}",
            'name': email.split('@')[0],
            'email': email,
            'passwordHash': generate_password_hash(password or 'demo'),
            'role': 'admin' if 'admin' in email else 'student',
            'createdAt': datetime.now().isoformat(),
            'preferences': {
                'targetScore': 85,
                'dailyAvailableHours': 3.5,
                'preferredLanguage': 'English',
                'preferredStudyDays': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                'studyStartTime': '18:00',
                'studyEndTime': '21:30',
                'theme': 'light'
            }
        }
        db_data['users'].append(user)
        save_data(db_data)
        
    return jsonify({
        'token': user['id'],
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'preferences': user.get('preferences', {})
        }
    })

@app.route('/api/auth/me', methods=['GET'])
def auth_me():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    db_data = load_data()
    user = next((u for u in db_data['users'] if u['id'] == token), None)
    if not user and db_data['users']:
        user = db_data['users'][0]
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify(user)

@app.route('/api/exams', methods=['GET', 'POST'])
def handle_exams():
    db_data = load_data()
    token = request.headers.get('Authorization', '').replace('Bearer ', '') or 'usr_default_01'
    
    if request.method == 'GET':
        user_exams = [e for e in db_data['exams'] if e.get('userId') == token and not e.get('isArchived')]
        return jsonify(user_exams)
        
    body = request.get_json() or {}
    new_exam = {
        'id': f"exam_{int(datetime.now().timestamp())}",
        'userId': token,
        'name': body.get('name', 'Untitled Exam'),
        'category': body.get('category', 'Competitive'),
        'examDate': body.get('examDate'),
        'dailyAvailableHours': float(body.get('dailyAvailableHours', 3)),
        'preferredStudyDays': body.get('preferredStudyDays', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        'targetScore': int(body.get('targetScore', 85)),
        'difficultyPreference': body.get('difficultyPreference', 'Medium'),
        'preferredLanguage': body.get('preferredLanguage', 'English'),
        'notes': body.get('notes', ''),
        'isArchived': False,
        'createdAt': datetime.now().isoformat(),
        'subjects': body.get('subjects', [])
    }
    db_data['exams'].append(new_exam)
    save_data(db_data)
    return jsonify(new_exam), 201

@app.route('/api/questions/generate', methods=['POST'])
def generate_questions():
    body = request.get_json() or {}
    subject = body.get('subject', 'General')
    topic = body.get('topic', 'Core Fundamentals')
    difficulty = body.get('difficulty', 'Medium')
    count = int(body.get('questionCount', 5))
    language = body.get('language', 'English')
    marks = float(body.get('marksPerQuestion', 2))
    neg = float(body.get('negativeMarksPerQuestion', 0.5))
    
    # Generate structured question objects
    questions = []
    for i in range(count):
        questions.append({
            'id': f"q_py_{int(datetime.now().timestamp())}_{i+1}",
            'questionText': f"{i+1}. In {subject}, what is the primary operational role of {topic}?",
            'options': {
                'A': f"To standardize procedural execution and state stability in {topic}.",
                'B': "To bypass hardware verification checks without logging.",
                'C': "To increase compute latency without cache validation.",
                'D': "To double physical register count dynamically."
            },
            'correctOption': 'A',
            'explanation': f"Under standard {subject} principles, {topic} ensures state consistency, boundary enforcement, and predictable execution.",
            'difficulty': difficulty,
            'subject': subject,
            'topic': topic,
            'marks': marks,
            'negativeMarks': neg,
            'sourceReference': f"Curriculum Unit {((i % 4) + 1)}"
        })
        
    return jsonify({
        'success': True,
        'questions': questions,
        'metadata': {
            'totalQuestions': len(questions),
            'totalMarks': sum(q['marks'] for q in questions),
            'difficulty': difficulty,
            'language': language
        }
    })

@app.route('/api/tests/submit', methods=['POST'])
def submit_test():
    body = request.get_json() or {}
    paper_id = body.get('paperId')
    user_answers = body.get('userAnswers', {})
    time_taken = int(body.get('timeTakenSeconds', 600))
    token = request.headers.get('Authorization', '').replace('Bearer ', '') or 'usr_default_01'
    
    db_data = load_data()
    paper = next((p for p in db_data['questionPapers'] if p['id'] == paper_id), None)
    if not paper:
        return jsonify({'error': 'Paper not found'}), 404
        
    correct_count = 0
    incorrect_count = 0
    unattempted_count = 0
    total_marks = 0.0
    evaluated = []
    
    for q in paper['questions']:
        selected = user_answers.get(q['id'])
        if not selected:
            unattempted_count += 1
            evaluated.append({'questionId': q['id'], 'userSelectedOption': None, 'isCorrect': False, 'marksAwarded': 0})
        elif selected.upper() == q['correctOption'].upper():
            correct_count += 1
            total_marks += float(q['marks'])
            evaluated.append({'questionId': q['id'], 'userSelectedOption': selected, 'isCorrect': True, 'marksAwarded': q['marks']})
        else:
            incorrect_count += 1
            penalty = float(q.get('negativeMarks', 0.5))
            total_marks -= penalty
            evaluated.append({'questionId': q['id'], 'userSelectedOption': selected, 'isCorrect': False, 'marksAwarded': -penalty})
            
    attempted = correct_count + incorrect_count
    accuracy = round((correct_count / attempted) * 100) if attempted > 0 else 0
    score_pct = round((total_marks / paper['totalMarks']) * 100) if paper['totalMarks'] > 0 else 0
    
    attempt = {
        'id': f"att_{int(datetime.now().timestamp())}",
        'paperId': paper_id,
        'examId': paper['examId'],
        'userId': token,
        'paperTitle': paper['title'],
        'mode': body.get('mode', 'online'),
        'startedAt': body.get('startedAt', datetime.now().isoformat()),
        'completedAt': datetime.now().isoformat(),
        'timeTakenSeconds': time_taken,
        'totalQuestions': len(paper['questions']),
        'correctAnswers': correct_count,
        'incorrectAnswers': incorrect_count,
        'unattempted': unattempted_count,
        'totalMarksObtained': round(total_marks, 2),
        'maxPossibleMarks': paper['totalMarks'],
        'scorePercentage': max(0, score_pct),
        'accuracyPercentage': accuracy,
        'answers': evaluated,
        'topicWisePerformance': {paper['topic']: {'total': len(paper['questions']), 'correct': correct_count}},
        'difficultyWisePerformance': {paper['difficulty']: {'total': len(paper['questions']), 'correct': correct_count}}
    }
    
    db_data['testAttempts'].append(attempt)
    save_data(db_data)
    return jsonify(attempt), 201

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    print(f"PrepPilot AI Python Backend running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
