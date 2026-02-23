import os, google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Just test gemini-1.5-flash and gemini-2.0-flash and gemini-flash-latest
models_to_test = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.5-flash']

for m in models_to_test:
    try:
        model = genai.GenerativeModel(m)
        resp = model.generate_content("hello")
        print("SUCCESS:", m)
    except Exception as e:
        err = getattr(e, 'code', type(e).__name__)
        print("ERROR:", m, "->", err)
