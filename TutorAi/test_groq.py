import os
import requests
from dotenv import load_dotenv

load_dotenv()

groq_api_key = os.getenv('GROQ_API_KEY')
print(f"API Key Starts With: {groq_api_key[:10] if groq_api_key else 'None'}")

response = requests.post(
    "https://api.groq.com/openai/v1/chat/completions",
    json={
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a test assistant."},
            {"role": "user", "content": "Hello!"}
        ],
        "max_tokens": 100,
        "temperature": 0.7
    },
    headers={
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json"
    },
    timeout=30
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
