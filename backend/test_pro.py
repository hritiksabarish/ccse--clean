import google.generativeai as genai

key1 = "AIzaSyDxIX6YJN2633808wJ6mZEHpq3kbyx-jzQ" # Old key

try:
    genai.configure(api_key=key1)
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Say hello")
    result = f"Success: {response.text}\n"
except Exception as e:
    result = f"Failed: {str(e)}\n"

with open("pro_result.txt", "w") as f:
    f.write(result)
