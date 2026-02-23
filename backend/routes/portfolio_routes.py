from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.portfolio import PortfolioAsset
from models.property import PropertyAnalysis
from database import db

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/assets', methods=['GET'])
@portfolio_bp.route('/portfolio/', methods=['GET'])
@jwt_required(optional=True)
def get_portfolio():
    user_id = get_jwt_identity()
    if user_id:
        assets = PortfolioAsset.query.filter_by(user_id=user_id).all()
        return jsonify([asset.to_dict() for asset in assets]), 200
    
    # For hackathon/demo: If no user, return all properties mapped to individual analysis entries
    analyses = PropertyAnalysis.query.all()
    return jsonify([a.to_dict() for a in analyses]), 200

@portfolio_bp.route('/upload', methods=['POST'])
@jwt_required()
def add_to_portfolio():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    analysis_id = data.get('analysis_id')
    if not analysis_id:
        return jsonify({"msg": "Analysis ID is required"}), 400
        
    # Check if analysis exists
    analysis = PropertyAnalysis.query.get(analysis_id)
    if not analysis:
        return jsonify({"msg": "Analysis result not found"}), 404
        
    # Prevent duplicates
    existing = PortfolioAsset.query.filter_by(user_id=user_id, property_id=analysis_id).first()
    if existing:
        return jsonify({"msg": "Asset already in portfolio"}), 400
        
    asset = PortfolioAsset(user_id=user_id, property_id=analysis_id)
    db.session.add(asset)
    db.session.commit()
    
    return jsonify(asset.to_dict()), 201

@portfolio_bp.route('/<int:asset_id>', methods=['DELETE'])
@jwt_required()
def delete_from_portfolio(asset_id):
    user_id = get_jwt_identity()
    asset = PortfolioAsset.query.filter_by(id=asset_id, user_id=user_id).first_or_404()
    
    db.session.delete(asset)
    db.session.commit()
    
    return jsonify({"msg": "Asset removed from portfolio"}), 200

@portfolio_bp.route('/alerts', methods=['GET'])
@jwt_required(optional=True)
def get_portfolio_alerts():
    # For demo: analyze all properties if no user context
    analyses = PropertyAnalysis.query.all()
    
    alerts = []
    flood_count = 0
    heat_count = 0
    
    for a in analyses:
        # Check flood risk in factors
        risks = a.risk_factors or {}
        if risks.get('flood', 0) > 60:
            flood_count += 1
            
        # Check temperature trend projection
        proj = a.projections or []
        if proj and proj[-1] > 2.0: # Significant increase
            heat_count += 1
            
    if flood_count > 0:
        alerts.append(f"{flood_count} assets projected high flood risk by 2040")
    if heat_count > 0:
        alerts.append(f"{heat_count} assets show extreme heat projection trends")
        
    if not alerts:
        alerts.append("All portfolio assets currently within stable climate risk parameters.")
        
    return jsonify({"alerts": alerts}), 200
