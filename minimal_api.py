# minimal_api.py - FIXED VERSION
from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import json
from collections import Counter  # This was missing!

app = Flask(__name__)
CORS(app)

# Enhanced toxic word database
# ============================================
# ENHANCED TOXIC PATTERNS DATABASE
# ============================================

TOXIC_PATTERNS = {
    # SEVERE TOXIC - Highest priority
    'severe_toxic': {
        'words': [
            'kill', 'die', 'suicide', 'murder', 'hurt you', 'go die', 'worthless', 'no one likes you', 'nobody loves you', 'should die', 'kill yourself', 'end your life', 'jump off', 'hang yourself', 'shoot yourself', 'better off dead', 'waste of life', 'waste of space', 'die slowly'
        ],
        'weight': 0.9,
        'category': 'severe_toxic',
        'color': '#d32f2f'
    },
    
    # HARASSMENT & BULLYING
    'harassment': {
        'words': [
            'stupid', 'idiot', 'dumb', 'moron', 'retard', 'imbecile', 'fool', 'ignorant', 'brainless', 'mindless', 'unintelligent', 'slow'
        ],
        'weight': 0.6,
        'category': 'harassment',
        'color': '#f44336'
    },
    
    # BODY SHAMING
    'body_shaming': {
        'words': [
            'fat', 'obese', 'skinny', 'anorexic', 'bulimic', 'ugly', 'hideous', 'disgusting', 'gross', 'repulsive', 'deformed', 'pig', 'cow', 'whale', 'flat chested', 'no boobs', 'no butt', 'man boobs', 'beer belly'
        ],
        'weight': 0.7,
        'category': 'body_shaming',
        'color': '#ff6b6b'
    },
    
    # INSULTS & NAME CALLING
    'insults': {
        'words': [
            'hate', 'suck', 'awful', 'terrible', 'bad', 'worst', 'pathetic', 'loser', 'failure', 'joke', 'clown', 'jerk', 'asshole', 'bastard', 'bitch', 'douche', 'jackass', 'dipstick', 'knucklehead'
        ],
        'weight': 0.5,
        'category': 'insults',
        'color': '#ff9800'
    },
    
    # HATE SPEECH - Identity based
    'hate_speech': {
        'patterns': [
            r'\bhate you\b', r'\bi hate\b', r'\byou suck\b', r'\byou\'re (stupid|dumb|ugly|fat|idiot)\b', r'\byou are (stupid|dumb|ugly|fat|idiot)\b', r'\bfuck you\b', r'\bstfu\b', r'\bshut up\b'
        ],
        'weight': 0.6,
        'category': 'hate_speech',
        'color': '#ff5722'
    },
    
    # DISCRIMINATION - Race, Religion, Gender
    'discrimination': {
        'words': [
            'black', 'white', 'asian', 'chinese', 'indian', 'muslim', 'christian', 'jewish', 'hindu', 'gay', 'lesbian', 'trans', 'homosexual', 'queer', 'immigrant', 'refugee', 'foreigner'
        ],  # Add actual slurs - using neutral terms for safety
        'weight': 0.8,
        'category': 'discrimination',
        'color': '#9c27b0'
    },
    
    # SEXUAL HARASSMENT
    'sexual_harassment': {
        'words': [
            'sexy', 'hot', 'slut', 'whore', 'babe', 'boobs', 'tits', 'ass', 'porn', 'nude', 'naked', 'strip', 'cam girl', 'onlyfans', 'send nudes', 'show boobs', 'show body'
        ],
        'weight': 0.7,
        'category': 'sexual_harassment',
        'color': '#e91e63'
    },
    
    # THREATS & INTIMIDATION
    'threats': {
        'words': [
            'beat', 'hit', 'punch', 'slap', 'fight', 'attack', 'hurt', 'harm', 'break your', 'smash your', 'destroy your', 'ruin your', 'find you', 'get you', 'come after', 'track you down'
        ],
        'weight': 0.8,
        'category': 'threats',
        'color': '#c2185b'
    },
    
    # SPAM & MISLEADING
    'spam': {
        'words': [
            'subscribe', 'follow me', 'like my', 'check my channel', 'click link', 'bit.ly', 'tinyurl', 'earn money', 'free gift', 'win prize', 'lottery', 'casino', 'bet now'
        ],
        'weight': 0.3,
        'category': 'spam',
        'color': '#757575'
    },
    
    # PROFANITY - Mild swearing
    'profanity': {
        'words': [
            'damn', 'hell', 'crap', 'piss', 'shit', 'fuck', 'screw','bloody', 'arse', 'bugger', 'bollocks'
        ],
        'weight': 0.4,
        'category': 'profanity',
        'color': '#ffb74d'
    }
}

def detect_cyberbullying(text):
    """Advanced rule-based detection with severity levels"""
    text_lower = text.lower().strip()
    
    if len(text_lower) < 3:
        return {
            'score': 0, 
            'categories': [], 
            'isToxic': False,
            'severity': 'none',
            'confidence': 0
        }
    
    total_score = 0
    categories = []
    detected_words = []
    category_scores = {}
    
    # Check each category
    for category, data in TOXIC_PATTERNS.items():
        category_score = 0
        
        # Check words
        if 'words' in data:
            for word in data['words']:
                if word in text_lower:
                    category_score += data['weight']
                    detected_words.append(word)
                    categories.append(data['category'])
        
        # Check regex patterns
        if 'patterns' in data:
            for pattern in data['patterns']:
                if re.search(pattern, text_lower):
                    category_score += data['weight']
                    categories.append(data['category'])
        
        if category_score > 0:
            category_scores[category] = min(category_score, 1.0)
            total_score += category_score
    
    # Check for repeated toxic words (more severe)
    word_count = Counter(text_lower.split())
    for word in set(detected_words):
        if word_count.get(word, 0) > 1:
            total_score += 0.2
    
    # Check for all caps (yelling)
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    if caps_ratio > 0.7 and len(text) > 10:
        total_score += 0.3
        categories.append('yelling')
    
    # Check for excessive punctuation
    punctuation_count = text.count('!') + text.count('?') * 0.5
    if punctuation_count > 5:
        total_score += min(punctuation_count * 0.1, 0.3)
        categories.append('excessive_punctuation')
    
    # Check for personal attacks (targeted at "you")
    if re.search(r'\byou\'?re?\b', text_lower) and any(word in text_lower for word in ['stupid', 'idiot', 'ugly', 'fat']):
        total_score += 0.4
        categories.append('personal_attack')
    
    # Normalize score (0-1)
    final_score = min(total_score, 1.0)
    
    # Determine severity
    if final_score > 0.8:
        severity = 'critical'
    elif final_score > 0.6:
        severity = 'high'
    elif final_score > 0.4:
        severity = 'medium'
    elif final_score > 0.2:
        severity = 'low'
    else:
        severity = 'none'
    
    # Determine if toxic
    is_toxic = final_score > 0.4  # Lowered threshold for better sensitivity
    
    # Get unique categories
    unique_categories = list(set(categories))
    
    # Generate enhanced warning message
    warning = ""
    if is_toxic:
        if severity == 'critical':
            warning = "🚨 CRITICAL: Extreme cyberbullying detected - Immediate action required"
        elif severity == 'high':
            warning = "⚠️ HIGH: Severe cyberbullying detected - Content must be reviewed"
        elif severity == 'medium':
            warning = "⚠️ MEDIUM: Cyberbullying detected - Please revise your content"
        else:
            warning = "⚠️ LOW: Potential cyberbullying - Consider being more respectful"
    
    # Get top categories with scores
    top_categories = []
    for cat, score in sorted(category_scores.items(), key=lambda x: x[1], reverse=True)[:3]:
        top_categories.append({
            'name': cat,
            'score': score,
            'color': TOXIC_PATTERNS.get(cat, {}).get('color', '#ff9800')
        })
    
    return {
        'score': round(final_score, 3),
        'categories': unique_categories,
        'isToxic': is_toxic,
        'severity': severity,
        'warning': warning,
        'toxicWords': list(set(detected_words)),
        'textLength': len(text),
        'wordCount': len(text.split()),
        'categoryDetails': top_categories,
        'capsRatio': round(caps_ratio, 2),
        'punctuationCount': punctuation_count
    }

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model': 'Advanced Rule-Based Detector v2',
        'endpoints': ['/api/detect', '/api/batch-detect', '/api/health'],
        'version': '1.0.0',
        'patterns_loaded': len(TOXIC_PATTERNS)
    })

@app.route('/api/detect', methods=['POST'])
def detect():
    try:
        data = request.json
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        if len(text) < 3:
            return jsonify({
                'error': 'Text too short',
                'score': 0,
                'isCyberbullying': False,
                'severity': 'none'
            }), 200
        
        result = detect_cyberbullying(text)
        
        return jsonify({
            'success': True,
            'text': text[:100] + ('...' if len(text) > 100 else ''),
            'isCyberbullying': result['isToxic'],
            'score': result['score'],
            'severity': result['severity'],
            'categories': result['categories'],
            'warning': result['warning'],
            'details': {
                'toxicWords': result['toxicWords'],
                'textLength': result['textLength'],
                'wordCount': result['wordCount'],
                'capsRatio': result['capsRatio'],
                'punctuationCount': result['punctuationCount'],
                'categoryDetails': result['categoryDetails']
            }
        })
        
    except Exception as e:
        print(f"Error in /api/detect: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False,
            'isCyberbullying': False,
            'score': 0
        }), 500

@app.route('/api/batch-detect', methods=['POST'])
def batch_detect():
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts or not isinstance(texts, list):
            return jsonify({'error': 'No texts array provided'}), 400
        
        results = []
        for text in texts:
            result = detect_cyberbullying(text)
            results.append({
                'text': text[:50] + ('...' if len(text) > 50 else ''),
                'isCyberbullying': result['isToxic'],
                'score': result['score'],
                'categories': result['categories'],
                'warning': result['warning']
            })
        
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        })
        
    except Exception as e:
        print(f"Error in /api/batch-detect: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Cyberbullying Detection API is running',
        'endpoints': ['/api/health', '/api/detect', '/api/batch-detect'],
        'documentation': 'POST text to /api/detect for detection'
    })

if __name__ == '__main__':
    print("""
    ╔══════════════════════════════════════════╗
    ║  Cyberbullying Detection API             ║
    ║  Advanced Rule-Based System              ║
    ║  Running on http://localhost:5000        ║
    ╚══════════════════════════════════════════╝
    """)
    print(f"✅ Loaded {len(TOXIC_PATTERNS)} detection patterns")
    print("✅ CORS enabled")
    print("✅ Ready for requests")
    app.run(host='0.0.0.0', port=5000, debug=True)