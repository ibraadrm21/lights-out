from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import hashlib
import time
import os
import jwt
from functools import wraps

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "f1_lights_out_secret_production_key_2026")
ALGORITHM = "HS256"

# In-memory local stores for rapid execution
users_db = {
    "checo@lightsout.f1": {
        "id": "usr_01",
        "email": "checo@lightsout.f1",
        "username": "ChecoSpeed",
        "displayName": "Sergio Speedster",
        "country": "México",
        "coins": 750,
        "score": 1850,
        "role": "admin"
    }
}
served_hashes_db = set()

# JWT Token helper
def generate_jwt(user_data):
    payload = {
        "sub": user_data["id"],
        "email": user_data["email"],
        "role": user_data.get("role", "user"),
        "iat": int(time.time()),
        "exp": int(time.time()) + 86400 # 24h
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token ausente o inválido"}), 401
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            request.user = payload
        except Exception as e:
            return jsonify({"error": "Token expirado o corrupto", "details": str(e)}), 401
        return f(*args, **kwargs)
    return decorated

# ----------------- ROUTES -----------------

@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

# Auth
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "checo@lightsout.f1")
    user = users_db.get(email)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    token = generate_jwt(user)
    return jsonify({"token": token, "user": user})

# Profile & Telemetry
@app.route("/api/users/profile", methods=["GET"])
def get_profile():
    return jsonify(users_db["checo@lightsout.f1"])

# AI Question generation endpoint
@app.route("/api/games/quiz/next", methods=["GET"])
def next_quiz_question():
    question_text = "¿Quién ostenta el récord de más victorias en una sola temporada (19 triunfos en 2023)?"
    answer = "Max Verstappen"
    options = ["Max Verstappen", "Lewis Hamilton", "Michael Schumacher", "Sebastian Vettel"]
    
    # Compute SHA-256 hash for anti-repeat verification
    q_hash = hashlib.sha256(f"{question_text}|{answer}".encode()).hexdigest()
    is_repeated = q_hash in served_hashes_db
    served_hashes_db.add(q_hash)

    return jsonify({
        "question": question_text,
        "answer": answer,
        "options": options,
        "hash": q_hash,
        "is_repeat": is_repeated,
        "points": 120
    })

# System Metrics
@app.route("/api/metrics", methods=["GET"])
def metrics():
    return jsonify({
        "status": "healthy",
        "uptime": "99.98%",
        "served_unique_hashes": len(served_hashes_db),
        "total_active_users": len(users_db),
        "f1_season": 2026
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
