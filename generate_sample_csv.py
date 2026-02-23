import csv
import random

def generate_csv():
    # Chennai area boundaries roughly
    min_lat, max_lat = 12.8, 13.2
    min_lng, max_lng = 80.1, 80.3
    
    locations = ["Chennai South", "OMR IT Corridor", "Guindy", "Velachery", "Tambaram", "Adyar", "Anna Nagar", "T Nagar", "Porur", "Navalur"]

    with open('C:\\Users\\sabar\\Desktop\\sample_portfolio_assets.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        # Required columns: lat, lng, score. Additional useful: id, location, asset_value, risk_level, property_name
        writer.writerow(['id', 'location', 'property_name', 'lat', 'lng', 'score', 'climate_score', 'asset_value', 'risk_level'])

        for i in range(1, 101):
            lat = round(random.uniform(min_lat, max_lat), 6)
            lng = round(random.uniform(min_lng, max_lng), 6)
            score = round(random.uniform(20, 95), 1)
            
            if score >= 80:
                risk = "Low"
            elif score >= 50:
                risk = "Medium"
            else:
                risk = "High"
                
            loc = random.choice(locations)
            name = f"Asset {loc} {i}"
            value = random.randint(5000000, 500000000) # 50L to 50Cr
            
            writer.writerow([i, loc, name, lat, lng, score, score, value, risk])

if __name__ == "__main__":
    generate_csv()
    print("CSV generated successfully at C:\\Users\\sabar\\Desktop\\sample_portfolio_assets.csv")
