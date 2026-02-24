from app import create_app
from database import db
from models.property import PropertyAnalysis
import random

app = create_app()

with app.app_context():
    # Fetch all properties
    properties = PropertyAnalysis.query.all()
    count = 0
    for p in properties:
        if p.longitude and p.latitude:
            # Chennai ocean boundary is roughly > 80.25
            if p.longitude > 80.25:
                # Clamp it to land (westwards)
                p.longitude = 80.25 - random.uniform(0.01, 0.08)
                count += 1
                
    db.session.commit()
    print(f"Fixed {count} properties that were in the water!")
