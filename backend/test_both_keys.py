import google.generativeai as genai

key1 = "AIzaSyDxIX6YJN2633808wJ6mZEHpq3kbyx-jzQ" # Old key
key2 = "AIzaSyDsLETkYFoVW_CCTQ8lsUassvvYjwscq8" # New key

def test_key(name, api_key):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content("Say hello")
        return f"[{name}] Success: {response.text}\n"
    except Exception as e:
        return f"[{name}] Failed: {str(e)}\n"

with open("key_test_results.txt", "w") as f:
    f.write("Testing Keys...\n")
    f.write(test_key("Old Key", key1))
    f.write(test_key("New Key", key2))
