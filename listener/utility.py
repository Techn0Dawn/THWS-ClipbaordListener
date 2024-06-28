import time

def log_clipboard_content(content, user_and_hostname, log_file):
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {content} - {user_and_hostname}\n")