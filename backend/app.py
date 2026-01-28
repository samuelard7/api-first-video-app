from flask import Flask, request, jsonify, redirect, abort
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import timedelta, datetime
from flask_jwt_extended import decode_token
import bcrypt
from dotenv import load_dotenv
import os
from yt_dlp import YoutubeDL


load_dotenv()

app = Flask(__name__)
jwt_secret = os.getenv('JWT_SECRET_KEY') or os.getenv('JWT_SECRET')
print(f"DEBUG: Loaded JWT Secret: {jwt_secret[:5]}...{jwt_secret[-5:] if jwt_secret else ''}")
app.config['JWT_SECRET_KEY'] = jwt_secret
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

jwt = JWTManager(app)
app.config["JWT_TOKEN_LOCATION"] = ["headers", "query_string"]
app.config["JWT_QUERY_STRING_NAME"] = "token"
CORS(app, resources={r"/*": {"origins": "*"}})  

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['video_app_db'] 


users = db.users
videos = db.videos


@app.route('/seed', methods=['GET'])
def seed_videos():
    if videos.count_documents({}) == 0:
        video_data = [
            {"title": "How Startups Fail", "description": "Lessons from real founders", "youtube_id": "9bZkp7q19f0", "thumbnail_url": "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg", "is_active": True},
            {"title": "Rick Astley - Never Gonna Give You Up", "description": "Classic meme", "youtube_id": "dQw4w9WgXcQ", "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "is_active": True},
            {"title": "Python Tutorial", "description": "Learn Python", "youtube_id": "rfscVS0vtbw", "thumbnail_url": "https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg", "is_active": True},
        ]
        videos.insert_many(video_data)
        return jsonify({"message": "Seeded 3 videos"}), 200
    return jsonify({"message": "Already seeded"}), 200


@app.route('/auth/signup', methods=['POST'])
def signup():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON (Content-Type: application/json)"}), 415
    
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    

    if not all([name, email, password]):
        return jsonify({"error": "Missing fields"}), 400

    if users.find_one({"email": email}):
        return jsonify({"error": "Email exists"}), 409

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = {"name": name, "email": email, "password_hash": hashed, "created_at": datetime.now()}
    users.insert_one(user)

    return jsonify({"message": "User created"}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user['_id']))
    return jsonify({"token": access_token}), 200

@app.route('/auth/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = users.find_one({"_id": ObjectId(user_id)}, {"_id": 0, "password_hash": 0})
    return jsonify(user), 200

@app.route('/auth/logout', methods=['POST'])
def logout():
  
    return jsonify({"message": "Logged out"}), 200


@app.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    video_list = list(videos.find({"is_active": True}).limit(2)) 
    import json
    for video in video_list:
        video['id'] = str(video['_id'])
        del video['_id']
        playback_token = create_access_token(
            identity=json.dumps({
                "video_id": video['id'],
                "yt_id": video['youtube_id']
            }),
            expires_delta=timedelta(hours=4)
        )
        video['playback_token'] = playback_token
        del video['youtube_id'] 
    return jsonify(video_list), 200

@app.route('/video/<video_id>/stream', methods=['GET'])
def stream_video(video_id):
    token = request.args.get('token')
    print(token) 
    if not token:
        return jsonify({"error": "Missing token"}), 403

    try:
        
        decoded_data = decode_token(token)
        print(decoded_data)
        data = decoded_data.get('sub')
        
        if isinstance(data, str):
            import json
            try:
                data = json.loads(data)
            except:
                pass

        if not isinstance(data, dict):
            return jsonify({"error": f"Token identity is not a dict, got {type(data).__name__}"}), 403
        
        if str(data.get('video_id')) != video_id:
            return jsonify({"error": f"Token video_id mismatch: {data.get('video_id')} vs {video_id}"}), 403
        
        yt_id = data.get('yt_id')
        if not yt_id:
            return jsonify({"error": "Missing yt_id in token identity"}), 403
        
        print(f"Valid token for yt_id: {yt_id}")
    except Exception as e:
        print("JWT verify failed:", str(e))
        return jsonify({"error": f"JWT decode failed: {str(e)}"}), 403


    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'ios'],
            }
        }
    }
    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={yt_id}", download=False)
            direct_url = info.get('url')
            if not direct_url:
                return jsonify({"error": "Could not extract stream"}), 500
            return redirect(direct_url, code=302)
    except Exception as e:
        print("yt-dlp error:", str(e))
        return jsonify({"error": f"Stream extraction failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
