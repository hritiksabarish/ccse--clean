import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")

try:
    genai.configure(api_key=api_key)
    with open("models_out_utf8.txt", "w", encoding="utf-8") as f:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(m.name + "\n")
except Exception as e:
    with open("models_out_utf8.txt", "w", encoding="utf-8") as f:
        f.write("Error: " + str(e))
