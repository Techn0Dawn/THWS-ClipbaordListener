import requests

url = 'http://localhost:8080/data'

def send(img, body):
    files = {
        'screenshot': ('screenshot.png', img, 'image/png')
    }

    #print(files)
    response = requests.post(url, data=body, files=files)
    if response.status_code == 200:
        print('Data uploaded successfully.')
    else:
        print(f'Failed to upload data. Status code: {response.status_code}')