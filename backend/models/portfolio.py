from database import db

class PortfolioAsset(db.Model):
    __tablename__ = 'portfolio_assets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('property_analyses.id'), nullable=False)

    # Relationships
    user = db.relationship('User', backref=db.backref('portfolio', lazy=True))
    property = db.relationship('PropertyAnalysis', backref=db.backref('portfolio_entries', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "property_id": self.property_id,
            "property_details": self.property.to_dict() if self.property else None
        }
