import sys
import os
import json

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from services.climate_engine import ClimateEngine

def test_full_analysis():
    test_cases = [
        {"address": "Patna Bihar 800001", "property_id": "PAT-001"},
        {"pincode": "560001", "property_id": "BLR-001"},
        {"latitude": 19.0760, "longitude": 72.8777, "property_id": "MUM-001"}
    ]

    for case in test_cases:
        print(f"\n--- Testing Analysis for: {case.get('address') or case.get('pincode') or case.get('latitude')} ---")
        try:
            result = ClimateEngine.analyze(case)
            if "error" in result:
                print(f"Error: {result['error']}")
            else:
                print(f"Location: {result['location_name']}")
                print(f"Coordinates: {result['coordinates']}")
                print(f"Temp Trend: {result['temperature_trend']}")
                print(f"Environment: {result['environment']}")
                print(f"Risk Profile: {result['risk_profile']}")
                print(f"Climate Score: {result['climate_score']}")
                
                # Validation
                assert len(result['temperature_trend']) > 0, "Temp trend should not be empty"
                assert "built_up" in result['environment'], "Environment should have built_up"
                assert "flood" in result['risk_profile'], "Risk profile should have flood"
        except Exception as e:
            print(f"Failed with exception: {e}")

if __name__ == "__main__":
    test_full_analysis()
