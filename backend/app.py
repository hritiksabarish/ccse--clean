from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database import db, init_db

# Import routes
from routes.auth_routes import auth_bp
from routes.analysis_routes import analysis_bp
from routes.portfolio_routes import portfolio_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*", "allow_headers": "*"}})

    # Setup JWT
    jwt = JWTManager(app)

    # Initialize Database
    init_db(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(analysis_bp, url_prefix='/api')
    app.register_blueprint(portfolio_bp, url_prefix='/api')

    # Global Error Handling
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized"}), 401

    @app.route('/')
    def index():
        return jsonify({
            "name": "Climate Credit Score Engine API",
            "version": "1.0.0",
            "status": "online"
        })

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)
