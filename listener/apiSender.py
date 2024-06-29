import requests

url = 'http://localhost:8080/data'

def send(img, body):
    files = {
        'screenshot': ('screenshot.png', img, 'image/png')
    }
    headers = {
        'Content-Type': 'application/json'
    }

    #print(files)
    response = requests.post(url, json=body, headers=headers)
    if response.status_code == 200:
        print('Data uploaded successfully.')
    else:
        print(f'Failed to upload data. Status code: {response.status_code}')