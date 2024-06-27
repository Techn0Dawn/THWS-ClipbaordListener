import win32clipboard
import win32con
import time
import utility

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

def monitor_clipboard(log_file):
    previous_content = None
    while True:
        current_content = get_clipboard_content()
        if current_content and current_content != previous_content:
            print("Detected new clipboard content, logging.")
            utility.log_clipboard_content(current_content, log_file)
            previous_content = current_content
        time.sleep(1)