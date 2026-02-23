from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from firebase_service import init_firebase, get_property, save_property, get_portfolio, get_all_properties
import os
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'climate-credit-secret-key-2026')

# Initialize Firebase
init_firebase()

# --- Simple in-memory users (replace with DB in production) ---
USERS = {
    'bank_official': {'password': 'official123', 'role': 'official', 'display': 'Bank Official'},
    'admin':         {'password': 'admin123',    'role': 'official', 'display': 'Admin'},
    'borrower':      {'password': 'borrower123', 'role': 'borrower', 'display': 'Loan Borrower'},
    'user1':         {'password': 'user123',     'role': 'borrower', 'display': 'User 1'},
}

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def official_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        if session.get('role') != 'official':
            flash('Access restricted to Bank Officials.')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated

# --- Auth routes ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user' in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        role_requested = request.form.get('role', 'borrower')

        user_data = USERS.get(username)
        if user_data and user_data['password'] == password and user_data['role'] == role_requested:
            session['user'] = user_data['display']
            session['username'] = username
            session['role'] = user_data['role']
            return redirect(url_for('index'))
        else:
            flash('Invalid credentials or wrong role selected.')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# --- App routes (protected) ---
@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/analysis')
@login_required
def analysis():
    return render_template('analysis.html')

@app.route('/results')
@login_required
def results():
    property_id = request.args.get('id')

    # Default fallback data
    score = 72
    risks = {'flood': 'Medium', 'heat': 'High', 'storm': 'Low', 'sea_level': 'Low'}
    timeline = [65, 59, 80, 81, 56, 55, 40]

    if property_id:
        property_data = get_property(property_id)
        if property_data and 'result' in property_data:
            result = property_data['result']
            score = result.get('score', score)
            risks = result.get('risks', risks)
            timeline = result.get('timeline', timeline)

    return render_template('results.html', score=score, risks=risks, timeline=timeline)

@app.route('/portfolio')
@official_required
def portfolio():
    return render_template('portfolio.html')

@app.route('/api/analyze', methods=['POST'])
@login_required
def analyze_property():
    data = request.json
    location = data.get('location', '')

    score = 85 if len(location) % 2 == 0 else 45

    result = {
        'score': score,
        'risks': {
            'flood': 'Low',
            'storm': 'Medium',
            'heatwave': 'High' if score < 50 else 'Low',
            'sea_level': 'Low'
        },
        'timeline': [20, 30, 45, 60]
    }

    doc_id = save_property(data, result)
    result['id'] = doc_id

    return jsonify(result)

@app.route('/api/portfolio', methods=['GET'])
@official_required
def get_portfolio_data():
    properties = get_all_properties()
    return jsonify(properties)

if __name__ == '__main__':
    app.run(debug=True)
