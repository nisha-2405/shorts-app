# app_complete.py - Complete API with video upload, comments, and cyberbullying detection
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sqlite3
from datetime import datetime
import hashlib
import secrets
from werkzeug.utils import secure_filename
import re
from collections import Counter
import json

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
THUMBNAIL_FOLDER = os.path.join(os.path.dirname(__file__), 'thumbnails')
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv', 'webm'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# Create upload folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(THUMBNAIL_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'shortsafe.db')

# ========== DATABASE HELPERS ==========
def get_db():
    return sqlite3.connect(DB_PATH)

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

# ========== AUTHENTICATION ==========
def hash_password(password):
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((password + salt).encode())
    return f"{salt}${hash_obj.hexdigest()}"

def verify_password(password, password_hash):
    salt, stored_hash = password_hash.split('$')
    hash_obj = hashlib.sha256((password + salt).encode())
    return hash_obj.hexdigest() == stored_hash

# ========== CYBERBULLYING DETECTION (Enhanced) ==========
TOXIC_PATTERNS = {
    'severe_toxic': {
        'words': ['kill', 'die', 'suicide', 'murder', 'hurt you', 'go die', 'worthless', 'no one likes you'],
        'weight': 0.9,
        'category': 'severe_toxic'
    },
    'harassment': {
        'words': ['stupid', 'idiot', 'dumb', 'moron', 'retard', 'fool', 'ignorant'],
        'weight': 0.6,
        'category': 'harassment'
    },
    'body_shaming': {
        'words': ['fat', 'ugly', 'skinny', 'obese', 'hideous', 'disgusting', 'pig', 'cow'],
        'weight': 0.7,
        'category': 'body_shaming'
    },
    'insults': {
        'words': ['hate', 'suck', 'awful', 'terrible', 'bad', 'worst', 'pathetic', 'loser'],
        'weight': 0.5,
        'category': 'insults'
    }
}

def detect_cyberbullying(text):
    """Detect cyberbullying in text and return score"""
    text_lower = text.lower().strip()
    
    if len(text_lower) < 3:
        return {'score': 0, 'isToxic': False, 'categories': []}
    
    total_score = 0
    categories = []
    
    for category, data in TOXIC_PATTERNS.items():
        if 'words' in data:
            for word in data['words']:
                if word in text_lower:
                    total_score += data['weight']
                    categories.append(data['category'])
    
    # Normalize score (0-1)
    final_score = min(total_score, 1.0)
    is_toxic = final_score > 0.4
    
    return {
        'score': round(final_score, 3),
        'isToxic': is_toxic,
        'categories': list(set(categories))
    }

# ========== API ENDPOINTS ==========

# Health check
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'database': 'SQLite (Free)',
        'features': ['auth', 'videos', 'comments', 'cyberbullying-detection']
    })

# ========== USER AUTHENTICATION ==========

# Register
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        
        if not all([email, username, password]):
            return jsonify({'error': 'Missing fields'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE email = ? OR username = ?', (email, username))
        if cursor.fetchone():
            return jsonify({'error': 'Email or username already exists'}), 400
        
        # Create user
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (email, username, password_hash)
            VALUES (?, ?, ?)
        ''', (email, username, password_hash))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'username': username,
            'email': email
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        conn = get_db()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user or not verify_password(password, user['password_hash']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Don't send password hash
        user.pop('password_hash', None)
        
        return jsonify({
            'success': True,
            'user': user
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== VIDEO UPLOAD ==========

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/videos/upload', methods=['POST'])
def upload_video():
    try:
        # Get form data
        user_id = request.form.get('user_id')
        title = request.form.get('title')
        description = request.form.get('description', '')
        
        if not all([user_id, title]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check cyberbullying in title
        toxicity = detect_cyberbullying(title)
        if toxicity['isToxic']:
            return jsonify({
                'error': 'Cyberbullying detected in title',
                'toxicity': toxicity
            }), 400
        
        # Check cyberbullying in description
        if description:
            desc_toxicity = detect_cyberbullying(description)
            if desc_toxicity['isToxic']:
                return jsonify({
                    'error': 'Cyberbullying detected in description',
                    'toxicity': desc_toxicity
                }), 400
        
        # Handle video file
        if 'video' not in request.files:
            return jsonify({'error': 'No video file'}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'error': 'No video selected'}), 400
        
        if not allowed_file(video_file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save video
        filename = secure_filename(f"{user_id}_{datetime.now().timestamp()}_{video_file.filename}")
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        video_file.save(video_path)
        
        # Save to database
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO videos (user_id, title, description, video_filename)
            VALUES (?, ?, ?, ?)
        ''', (user_id, title, description, filename))
        
        video_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'video_id': video_id,
            'message': 'Video uploaded successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get all videos
@app.route('/api/videos', methods=['GET'])
def get_videos():
    try:
        conn = get_db()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT v.*, u.username, u.profile_pic,
                   (SELECT COUNT(*) FROM likes WHERE video_id = v.id) as like_count,
                   (SELECT COUNT(*) FROM comments WHERE video_id = v.id) as comment_count
            FROM videos v
            JOIN users u ON v.user_id = u.id
            ORDER BY v.created_at DESC
        ''')
        
        videos = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'videos': videos
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Stream video
@app.route('/api/videos/stream/<filename>', methods=['GET'])
def stream_video(filename):
    try:
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        return send_file(video_path, mimetype='video/mp4')
    except Exception as e:
        return jsonify({'error': str(e)}), 404

# ========== COMMENTS ==========

# Add comment
@app.route('/api/comments/add', methods=['POST'])
def add_comment():
    try:
        data = request.json
        user_id = data.get('user_id')
        video_id = data.get('video_id')
        content = data.get('content')
        
        if not all([user_id, video_id, content]):
            return jsonify({'error': 'Missing fields'}), 400
        
        # Check cyberbullying in comment
        toxicity = detect_cyberbullying(content)
        is_flagged = 1 if toxicity['isToxic'] else 0
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO comments (user_id, video_id, content, toxicity_score, is_flagged)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, video_id, content, toxicity['score'], is_flagged))
        
        comment_id = cursor.lastrowid
        conn.commit()
        
        # Get comment with user info
        cursor.execute('''
            SELECT c.*, u.username, u.profile_pic
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        ''', (comment_id,))
        
        comment = cursor.fetchone()
        conn.close()
        
        # Convert to dict
        columns = ['id', 'user_id', 'video_id', 'content', 'toxicity_score', 
                  'is_flagged', 'created_at', 'username', 'profile_pic']
        comment_dict = dict(zip(columns, comment))
        
        return jsonify({
            'success': True,
            'comment': comment_dict,
            'toxicity_warning': toxicity['isToxic']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get comments for video
@app.route('/api/comments/<int:video_id>', methods=['GET'])
def get_comments(video_id):
    try:
        conn = get_db()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT c.*, u.username, u.profile_pic
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.video_id = ?
            ORDER BY c.created_at DESC
        ''', (video_id,))
        
        comments = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'comments': comments
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== LIKES ==========

# Like/unlike video
@app.route('/api/likes/toggle', methods=['POST'])
def toggle_like():
    try:
        data = request.json
        user_id = data.get('user_id')
        video_id = data.get('video_id')
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if already liked
        cursor.execute('SELECT id FROM likes WHERE user_id = ? AND video_id = ?', (user_id, video_id))
        existing = cursor.fetchone()
        
        if existing:
            # Unlike
            cursor.execute('DELETE FROM likes WHERE user_id = ? AND video_id = ?', (user_id, video_id))
            liked = False
        else:
            # Like
            cursor.execute('INSERT INTO likes (user_id, video_id) VALUES (?, ?)', (user_id, video_id))
            liked = True
        
        # Get updated like count
        cursor.execute('SELECT COUNT(*) as count FROM likes WHERE video_id = ?', (video_id,))
        count = cursor.fetchone()[0]
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'liked': liked,
            'like_count': count
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== USER PROFILE ==========

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    try:
        conn = get_db()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        # Get user info
        cursor.execute('SELECT id, username, email, bio, profile_pic, created_at FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        # Get user's videos
        cursor.execute('''
            SELECT * FROM videos WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (user_id,))
        videos = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            'success': True,
            'user': user,
            'videos': videos
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("""
    ╔══════════════════════════════════════════╗
    ║  ShortsSafe Complete API                 ║
    ║  SQLite Database (FREE!)                 ║
    ║  Features: Auth, Videos, Comments        ║
    ║  Cyberbullying Detection Active          ║
    ╚══════════════════════════════════════════╝
    """)
    app.run(host='0.0.0.0', port=5000, debug=True)