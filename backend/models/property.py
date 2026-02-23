from database import db
from datetime import datetime

class PropertyAnalysis(db.Model):
    __tablename__ = 'property_analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    property_name = db.Column(db.String(150), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    asset_value = db.Column(db.Float, nullable=False)
    loan_term = db.Column(db.Integer, nullable=False)
    climate_score = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.String(50), nullable=False)
    # Primary Risk Parameters
    heat_risk = db.Column(db.Float, nullable=True)
    flood_risk = db.Column(db.Float, nullable=True)
    storm_risk = db.Column(db.Float, nullable=True)
    fire_risk = db.Column(db.Float, nullable=True)
    overall_risk_score = db.Column(db.Float, nullable=True)
    ml_risk_score = db.Column(db.Float, nullable=True)

    # Environmental Composition
    greenery_percent = db.Column(db.Float, nullable=True)
    water_percent = db.Column(db.Float, nullable=True)
    builtup_percent = db.Column(db.Float, nullable=True)

    # Climate Data
    avg_temperature = db.Column(db.Float, nullable=True)
    precipitation = db.Column(db.Float, nullable=True)
    elevation = db.Column(db.Float, nullable=True)

    # Legacy fields (kept for backward compatibility or complex objects)
    risk_factors = db.Column(db.JSON, nullable=True)
    projections = db.Column(db.JSON, nullable=True)   
    ai_insights = db.Column(db.Text, nullable=True)  
    loan_recommendation = db.Column(db.JSON, nullable=True) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "analysis_id": self.id,
            "id": self.id,
            "property_name": self.property_name,
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "asset_value": self.asset_value,
            "loan_term": self.loan_term,
            "climate_score": self.climate_score,
            "risk_level": self.risk_level,
            
            # Explicit Strict Data Mappings
            "heat_risk": self.heat_risk,
            "flood_risk": self.flood_risk,
            "storm_risk": self.storm_risk,
            "fire_risk": self.fire_risk,
            "overall_risk_score": self.overall_risk_score,
            "ml_risk_score": self.ml_risk_score,
            "greenery_percent": self.greenery_percent,
            "water_percent": self.water_percent,
            "builtup_percent": self.builtup_percent,
            "avg_temperature": self.avg_temperature,
            "precipitation": self.precipitation,
            "elevation": self.elevation,
            "timestamp": self.created_at.isoformat(),
            
            # Legacy/Complex JSONs
            "risk_factors": self.risk_factors,
            "projections": self.projections,
            "ai_insights": self.ai_insights,
            "loan_recommendation": self.loan_recommendation,
            "created_at": self.created_at.isoformat()
        }
