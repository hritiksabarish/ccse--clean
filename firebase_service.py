import firebase_admin
from firebase_admin import credentials, firestore
import os

db = None

def init_firebase():
    global db
    if not firebase_admin._apps:
        # Use a service account
        # IMPORTANT: Replace 'path/to/serviceAccount.json' with the actual path to your downloaded JSON
        # For this demo, we'll try to use a dummy or environment variable if available, 
        # but in a real app, this file is required.
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("Firebase initialized successfully.")
        else:
            print(f"Warning: Firebase credentials not found at {cred_path}. Firestore features will be disabled.")
            db = None

def save_property(input_data, result_data):
    if not db:
        return None
    
    # Create a new document in 'properties' collection
    try:
        doc_ref = db.collection('properties').document()
        doc_ref.set({
            'input': input_data,
            'result': result_data,
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        print(f"Property saved with ID: {doc_ref.id}")
        return doc_ref.id
    except Exception as e:
        print(f"Error saving property: {e}")
        return None

def get_property(property_id):
    if not db:
        return None
    try:
        doc_ref = db.collection('properties').document(property_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        else:
            return None
    except Exception as e:
        print(f"Error getting property: {e}")
        return None

def get_all_properties():
    if not db:
        return []
    try:
        docs = db.collection('properties').stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        print(f"Error getting portfolio: {e}")
        return []

def get_portfolio():
    # Placeholder if we need separate portfolio logic
    return get_all_properties()
