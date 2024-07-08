# How to work with this Repository
## Python Script
##### Add an virtual environment for python if not already done
```python -m venv clipboardListener-env```
##### Activate the venv
On Windows, run:

```clipboardListener\Scripts\activate```
On Unix or MacOS, run:

```source clipboardListener/bin/activate```

### install needed packages
``` python -m pip install -r requirements.txt ```

###### Update the requirements.txt file for new added packages

``` python -m pip freeze > requirements.txt ```

## Frontend

### Create an .env file in the frontend directory and set the key _VITE_REACT_APP_BACKEND_API_ with the URL to your backend.


# How to start
```
~/Clipboard-Listener\webserver\backend> node server.js
~/Clipboard-Listener\webserver\frontend> npm run dev
```
