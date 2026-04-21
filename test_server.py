import requests
r = requests.get('http://127.0.0.1:8000/')
print('Status:', r.status_code)
print('Content length:', len(r.text))
print('Contains root div:', 'id="root"' in r.text)
print('First 500 chars:', r.text[:500])
