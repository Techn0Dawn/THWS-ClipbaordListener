import time
import threading
import platform
import windows


def main():
    log_file = 'clipboard_log.txt'
    print("Starting")
    if platform.system() == 'Windows':    
        print("Monitoring clipboard. Press CTRL+C to stop.")
        clipboard_thread = threading.Thread(target=windows.monitor_clipboard, args=(log_file,), daemon=True)
        clipboard_thread.start()
    else:
        print("Error: This script only supports Windows.")
        return       
    
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        print("Monitoring stopped.")

if __name__ == '__main__':
    main()
