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
    risk_factors = db.Column(db.JSON, nullable=True) # Stores detailed risk breakups
    projections = db.Column(db.JSON, nullable=True)   # Stores future projections
    ai_insights = db.Column(db.Text, nullable=True)  # AI explanation
    loan_recommendation = db.Column(db.JSON, nullable=True) # Stores adjustment, text, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "property_name": self.property_name,
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "asset_value": self.asset_value,
            "loan_term": self.loan_term,
            "climate_score": self.climate_score,
            "risk_level": self.risk_level,
            "risk_factors": self.risk_factors,
            "projections": self.projections,
            "ai_insights": self.ai_insights,
            "loan_recommendation": self.loan_recommendation,
            "created_at": self.created_at.isoformat()
        }
