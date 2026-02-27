import requests
import json

# Test the API
url = "http://localhost:8000/api/ask/"
headers = {"Content-Type": "application/json"}
data = {"question": "What is 2+2?"}

try:
    response = requests.post(url, headers=headers, json=data, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
