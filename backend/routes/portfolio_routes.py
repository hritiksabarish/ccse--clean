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

@portfolio_bp.route('/bulk-upload', methods=['POST'])
@jwt_required(optional=True)
def bulk_upload_portfolio():
    user_id = get_jwt_identity()
    assets_data = request.get_json()
    
    if not isinstance(assets_data, list):
        return jsonify({"msg": "Expected a JSON array of assets"}), 400
        
    created_analyses = []
    
    for item in assets_data:
        try:
            # Basic risk level calculation to ensure model doesn't crash on null constraint
            score = float(item.get('climate_score') or item.get('score') or 0)
            if score >= 80:
                risk_level = 'Low'
            elif score >= 50:
                risk_level = 'Medium'
            else:
                risk_level = 'High'
                
            # Generate mathematically sound dynamic data based on the explicit score input
            import random
            base_risk = max(0, 100 - score)
            
            dynamic_risks = {
                "flood": round(min(100, max(0, base_risk + random.uniform(-15, 15))), 1),
                "heat": round(min(100, max(0, base_risk + random.uniform(-10, 20))), 1),
                "storm": round(min(100, max(0, base_risk + random.uniform(-20, 10))), 1),
                "fire": round(min(100, max(0, base_risk + random.uniform(-25, 5))), 1),
                "sea_level": round(min(100, max(0, base_risk + random.uniform(-10, 10))), 1)
            }
            
            # Dynamic projection trend logic peaking over the next 4 decades
            curr_inc = random.uniform(0.5, 1.5)
            step = max(0.1, (base_risk / 100.0) * random.uniform(0.5, 1.2))
            dynamic_projections = [
                {"year": 2030, "value": round(curr_inc + step * 1, 2)},
                {"year": 2040, "value": round(curr_inc + step * 2, 2)},
                {"year": 2050, "value": round(curr_inc + step * 3, 2)},
                {"year": 2060, "value": round(curr_inc + step * 4, 2)},
                {"year": 2070, "value": round(curr_inc + step * 5, 2)}
            ]
            
            # Bank recommendation logic
            if score > 80:
                rec_text = "Strong climate resilience. Reduced base interest rate recommended."
            elif score >= 50:
                rec_text = "Standard loan terms apply. Periodic environmental risk appraisals advised."
            else:
                rec_text = "Critical risk exposure. High risk premium and mandatory catastrophe insurance strongly advised."
                
            dynamic_loan_rec = {
                "recommended_interest_adjustment": -0.15 if score > 80 else (0.25 if score < 50 else 0),
                "risk_level": risk_level,
                "recommendation_text": rec_text
            }

            analysis = PropertyAnalysis(
                property_name=item.get('property_name') or 'Unnamed Asset',
                address=item.get('address') or 'Unknown',
                latitude=float(item.get('latitude') or 0) if item.get('latitude') is not None else None,
                longitude=float(item.get('longitude') or 0) if item.get('longitude') is not None else None,
                asset_value=float(item.get('asset_value') or 0),
                loan_term=int(item.get('loan_term') or 30),
                climate_score=score,
                risk_level=risk_level,
                
                # Explicit strict DB mappings
                heat_risk=dynamic_risks["heat"],
                flood_risk=dynamic_risks["flood"],
                storm_risk=dynamic_risks["storm"],
                fire_risk=dynamic_risks["fire"],
                overall_risk_score=score,
                ml_risk_score=round(score + random.uniform(-5, 5), 1),
                
                # Default Mock Environmental and Climate Params for Bulk Testing CSV
                greenery_percent=30.0 + random.uniform(-10, 20),
                water_percent=15.0 + random.uniform(-5, 10),
                builtup_percent=55.0 + random.uniform(-15, 15),
                avg_temperature=28.5 + random.uniform(-3, 3),
                precipitation=120.0 + random.uniform(-40, 40),
                elevation=45.0 + random.uniform(-20, 50),

                risk_factors=dynamic_risks,
                projections=dynamic_projections,
                loan_recommendation=dynamic_loan_rec
            )
            db.session.add(analysis)
            created_analyses.append(analysis)
        except Exception as e:
            print(f"Skipping invalid asset row: {e}")
            continue
            
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Database commit failed: {str(e)}"}), 500
        
    # If user is logged in, link these global analyses to their personal portfolio
    if user_id:
        for analysis in created_analyses:
            portfolio_asset = PortfolioAsset(user_id=user_id, property_id=analysis.id)
            db.session.add(portfolio_asset)
        try:
            db.session.commit()
        except:
            db.session.rollback()
        
    return jsonify({"msg": f"Successfully uploaded {len(created_analyses)} assets", "count": len(created_analyses)}), 201

@portfolio_bp.route('/<int:asset_id>', methods=['DELETE'])
@jwt_required()
def delete_from_portfolio(asset_id):
    user_id = get_jwt_identity()
    asset = PortfolioAsset.query.filter_by(id=asset_id, user_id=user_id).first_or_404()
    
    db.session.delete(asset)
    db.session.commit()
    
    return jsonify({"msg": "Asset removed from portfolio"}), 200

@portfolio_bp.route('/remove-asset/<int:analysis_id>', methods=['DELETE'])
@jwt_required(optional=True)
def remove_global_asset(analysis_id):
    # This route explicitly deletes the analysis globally from the DB to support the unauthenticated UI demo
    analysis = PropertyAnalysis.query.get(analysis_id)
    if not analysis:
        return jsonify({"msg": "Asset not found"}), 404
        
    db.session.delete(analysis)
    db.session.commit()
    
    return jsonify({"msg": "Asset globally removed"}), 200

@portfolio_bp.route('/clear-all', methods=['DELETE'])
@jwt_required(optional=True)
def clear_all_assets():
    # Instantly drop all tracking records for the demo UI
    try:
        db.session.query(PropertyAnalysis).delete()
        db.session.commit()
        return jsonify({"msg": "Portfolio successfully cleared"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Failed to clear portfolio: {str(e)}"}), 500

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
        flood_risk = risks.get('flood', 0) if isinstance(risks, dict) else 0
        flood_val = flood_risk.get('value', 0) if isinstance(flood_risk, dict) else flood_risk
        
        if isinstance(flood_val, (int, float)) and flood_val > 60:
            flood_count += 1
            
        # Check temperature trend projection
        proj = a.projections or []
        if isinstance(proj, list) and len(proj) > 0:
            last_proj = proj[-1]
            if isinstance(last_proj, dict) and last_proj.get('value', 0) > 2.0:
                heat_count += 1
            elif isinstance(last_proj, (int, float)) and last_proj > 2.0:
                heat_count += 1
            
    if flood_count > 0:
        alerts.append(f"{flood_count} assets projected high flood risk by 2040")
    if heat_count > 0:
        alerts.append(f"{heat_count} assets show extreme heat projection trends")
        
    if not alerts:
        alerts.append("All portfolio assets currently within stable climate risk parameters.")
        
    return jsonify({"alerts": alerts}), 200

@portfolio_bp.route('/portfolio/report', methods=['GET'])
@jwt_required(optional=True)
def download_portfolio_report():
    from services.report_service import ReportService
    from flask import send_file
    
    user_id = get_jwt_identity()
    if user_id:
        assets = PortfolioAsset.query.filter_by(user_id=user_id).all()
        properties = [PropertyAnalysis.query.get(a.property_id) for a in assets if PropertyAnalysis.query.get(a.property_id)]
    else:
        # For hackathon/demo
        properties = PropertyAnalysis.query.all()
        
    if not properties:
        return jsonify({"error": "No assets in portfolio"}), 404
        
    total_score = sum((p.climate_score or 0) for p in properties)
    total_value = sum((p.asset_value or 0) for p in properties)
    
    high = sum(1 for p in properties if (p.climate_score or 0) < 50)
    med = sum(1 for p in properties if 50 <= (p.climate_score or 0) < 80)
    low = sum(1 for p in properties if (p.climate_score or 0) >= 80)
    
    stats = {
        'avg_score': round(total_score / len(properties)),
        'total_value': total_value,
        'high_risk': high,
        'med_risk': med,
        'low_risk': low
    }
    
    pdf_buffer = ReportService.generate_portfolio_report(properties, stats)
    
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name="Portfolio_Climate_Report.pdf"
    )
