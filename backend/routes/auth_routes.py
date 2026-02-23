from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import User
from database import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"msg": "Missing required fields"}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "User already exists"}), 400
        
    user = User(
        name=data['name'],
        email=data['email'],
        role=data.get('role', 'borrower')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"msg": "User registered successfully", "user": user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Missing email or password"}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "msg": "Login successful",
            "access_token": access_token,
            "user": user.to_dict()
        }), 200
        
    return jsonify({"msg": "Invalid email or password"}), 401
