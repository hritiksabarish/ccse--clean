from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.property import PropertyAnalysis
from services.climate_engine import ClimateEngine
from services.report_service import ReportService
from database import db
import google.generativeai as genai
import os
import requests
import csv

analysis_bp = Blueprint('analysis', __name__)

# ... (rest of the file remains same, adding endpoints at the bottom)

@analysis_bp.route('/report/<int:analysis_id>', methods=['GET'])
def download_report(analysis_id):
    analysis = PropertyAnalysis.query.get_or_404(analysis_id)
    pdf_buffer = ReportService.generate_property_report(analysis)
    
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"Climate_Report_{analysis_id}.pdf"
    )

@analysis_bp.route('/ai-chat', methods=['POST'])
def ai_chat():
    import logging
    from dotenv import load_dotenv
    
    # Ensure environment variables are loaded
    load_dotenv()
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        data = request.get_json()
        if not data:
            logger.warning("Invalid JSON received or body is empty.")
            return jsonify({
                "success": False,
                "error": "Invalid request: JSON body is required."
            }), 400
            
        # The prompt instructed to expect 'message' and 'analysis_data'
        user_message = data.get('message') or data.get('question')
        analysis_data = data.get('analysis_data', {})
        
        if not user_message:
            logger.warning("No message provided in the request.")
            return jsonify({
                "success": False,
                "error": "A 'message' is required to generate a response."
            }), 400
            
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY is not set in environment variables.")
            return jsonify({
                "success": False,
                "error": "Chat unavailable. AI service configuration is missing."
            }), 500

        logger.info("Initializing Google Gemini API...")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        context_prompt = f"""
        You are a professional, highly knowledgeable climate risk assistant for a fintech platform.
        Your role is to help users (investors, lenders, or property owners) understand the climate-related 
        financial risks associated with a specific property based *only* on the numerical data provided below.
        
        PROPERTY CLIMATE ANALYSIS DATA:
        {analysis_data}
        
        INSTRUCTIONS:
        1. Answer the user's question concisely, clearly, and professionally.
        2. Base your answer EXCLUSIVELY on the provided 'PROPERTY CLIMATE ANALYSIS DATA'. 
        3. Do not hallucinate external data, metrics, or recommendations not supported by the context.
        4. If the data does not contain the answer to the user's question, politely state that you can only 
           advise based on the provided climate analysis metrics.
        """
        
        full_prompt = f"{context_prompt}\n\nUSER QUESTION: {user_message}"
        
        logger.info(f"Sending prompt to Gemini for analysis processing...")
        response = model.generate_content(full_prompt)
        
        if not response or not response.text:
            raise ValueError("Empty response received from Gemini API.")
            
        logger.info("Successfully received response from Gemini API.")
        
        return jsonify({
            "success": True,
            "response": response.text.strip()
            # Note: "response" key used instead of previous "answer" key matching requirements.
        }), 200

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Error during AI Chat processing: {error_details}", exc_info=True)
        return jsonify({
            "success": False,
            "error": f"An internal error occurred: {str(e)}",
            "details": error_details
        }), 500

@analysis_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    
    # Integrate ClimateEngine analysis
    analysis_result = ClimateEngine.analyze(data)
    
    if "error" in analysis_result:
        return jsonify(analysis_result), 400

    # --- STEP 2: DATA LOGGING ---
    try:
        log_file = os.path.join(os.getcwd(), 'ml-earth-engine', 'earth_training_data.csv')
        # Ensure directory exists if we are running from a different place
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        file_exists = os.path.isfile(log_file)
        with open(log_file, 'a', newline='') as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(['heat_risk', 'flood_risk', 'storm_risk', 'elevation', 'temperature_trend', 'green_cover_ratio', 'final_climate_score'])
            
            writer.writerow([
                analysis_result['risk_profile']['heat'],
                analysis_result['risk_profile']['flood'],
                analysis_result['risk_profile'].get('storm', 0),
                analysis_result.get('elevation', 45.0),
                analysis_result.get('temperature_trend', [0.8])[0], # Using first trend value as simplified feature
                analysis_result.get('environment', {}).get('greenery', 0),
                analysis_result['climate_score']
            ])
    except Exception as e:
        print(f"ML Logging Error: {e}")

    # --- STEP 5 & 6: CONNECT TO ML MODEL & FALLBACK ---
    ml_score = analysis_result['climate_score'] # Default to original
    try:
        ml_payload = {
            "heat_risk": analysis_result['risk_profile']['heat'],
            "flood_risk": analysis_result['risk_profile']['flood'],
            "storm_risk": analysis_result['risk_profile'].get('storm', 0),
            "elevation": analysis_result.get('elevation', 45.0),
            "temperature_trend": analysis_result.get('temperature_trend', [0.8])[0],
            "green_cover_ratio": analysis_result.get('environment', {}).get('greenery', 0)
        }
        ml_response = requests.post("http://localhost:5050/ml-predict", json=ml_payload, timeout=2)
        if ml_response.status_code == 200:
            ml_data = ml_response.json()
            if 'ml_score' in ml_data:
                ml_score = ml_data['ml_score']
                # Replace ONLY the final score calculation logic
                analysis_result['climate_score'] = ml_score
    except Exception as e:
        print(f"ML Prediction Service unavailable, falling back to original score: {e}")

    # Persist to database for Portfolio
    analysis = PropertyAnalysis(
        property_name=data.get('property_id') or analysis_result['location_name'],
        address=analysis_result['location_name'],
        latitude=analysis_result['coordinates'][0],
        longitude=analysis_result['coordinates'][1],
        asset_value=float(data.get('asset_value', 0)),
        loan_term=int(data.get('loan_term', 30)),
        climate_score=analysis_result['climate_score'],
        risk_level=analysis_result['loan_recommendation']['risk_level'],
        
        # Explicit Structural DB mappings
        heat_risk=analysis_result['risk_profile']['heat'],
        flood_risk=analysis_result['risk_profile']['flood'],
        storm_risk=analysis_result['risk_profile'].get('storm', 0),
        fire_risk=analysis_result['risk_profile'].get('fire', 0),
        overall_risk_score=analysis_result.get('overall_risk_score', analysis_result['climate_score']),
        ml_risk_score=analysis_result.get('ml_risk_score', analysis_result['climate_score']),
        
        greenery_percent=analysis_result.get('environment', {}).get('greenery', 0),
        water_percent=analysis_result.get('environment', {}).get('water', 0),
        builtup_percent=analysis_result.get('environment', {}).get('built_up', 0),
        
        avg_temperature=analysis_result.get('avg_temperature', 28.5),
        precipitation=analysis_result.get('precipitation', 120.0),
        elevation=analysis_result.get('elevation', 45.0),

        # Keep legacy fallback structure intact
        risk_factors=analysis_result['risk_profile'],
        projections=analysis_result.get('temperature_projection', []), 
        ai_insights=analysis_result.get('ai_insights'),
        loan_recommendation=analysis_result.get('loan_recommendation')
    )
    
    db.session.add(analysis)
    db.session.commit()

    return jsonify(analysis.to_dict()), 200

@analysis_bp.route('/analyze-property', methods=['POST'])
@jwt_required(optional=True)
def analyze_property():
    data = request.get_json()
    
    # Perform analysis using Service
    analysis_result = ClimateEngine.analyze(data)
    
    if "error" in analysis_result:
        return jsonify(analysis_result), 400
        
    # Save analysis to database
    analysis = PropertyAnalysis(
        property_name=data.get('property_name') or data.get('property_id') or analysis_result['location_name'],
        address=analysis_result['location_name'],
        latitude=analysis_result['coordinates'][0],
        longitude=analysis_result['coordinates'][1],
        asset_value=float(data.get('asset_value', 100000)),
        loan_term=int(data.get('loan_term', 30)),
        climate_score=analysis_result['climate_score'],
        risk_level=analysis_result['loan_recommendation']['risk_level'],
        
        # Explicit Structural DB mappings defined by requirement
        heat_risk=analysis_result['risk_profile']['heat'],
        flood_risk=analysis_result['risk_profile']['flood'],
        storm_risk=analysis_result['risk_profile'].get('storm', 0),
        fire_risk=analysis_result['risk_profile'].get('fire', 0),
        overall_risk_score=analysis_result.get('overall_risk_score', analysis_result['climate_score']),
        ml_risk_score=analysis_result.get('ml_risk_score', analysis_result['climate_score']),
        
        greenery_percent=analysis_result.get('environment', {}).get('greenery', 0),
        water_percent=analysis_result.get('environment', {}).get('water', 0),
        builtup_percent=analysis_result.get('environment', {}).get('built_up', 0),
        
        avg_temperature=analysis_result.get('avg_temperature', 28.5),
        precipitation=analysis_result.get('precipitation', 120.0),
        elevation=analysis_result.get('elevation', 45.0),

        # Keep fallback JSON structure intact for existing legacy mapping hooks
        risk_factors=analysis_result['risk_profile'],
        projections=analysis_result.get('temperature_projection', []), 
        ai_insights=analysis_result.get('ai_insights'),
        loan_recommendation=analysis_result.get('loan_recommendation')
    )
    
    db.session.add(analysis)
    db.session.commit()
    
    return jsonify(analysis.to_dict()), 201

@analysis_bp.route('/results/<int:analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    analysis = PropertyAnalysis.query.get_or_404(analysis_id)
    return jsonify(analysis.to_dict()), 200

@analysis_bp.route('/geocode', methods=['GET'])
def geocode():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
        
    print(f"DEBUG: Geocoding request for: {query}")
    coords = ClimateEngine._geocode(query)
    
    if not coords:
        return jsonify({"error": "Location not found"}), 404
        
    # Get display name if possible, or use query as fallback
    # Nominatim returns full data in _geocode if we modify it slightly, 
    # but let's stick to the simplest working version requested.
    return jsonify({
        "lat": coords['lat'],
        "lng": coords['lon'],
        "display_name": query
    }), 200

