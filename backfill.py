import urllib.request
import json
import time

URL = "https://script.google.com/macros/s/AKfycbzywuUrsmIPXprMMUP168OO9pXAFGcXgtVtMSb8TiHQaqAWXZWOzG9zJZ4REtlzdq7s_Q/exec"

dates = [
    "2026-06-11", 
    "2026-06-12", 
    "2026-06-13", 
    "2026-06-14", 
    "2026-06-15", 
    "2026-06-16"
]

print("Starting backfill for Ganesh...")

for d in dates:
    print(f"Backfilling {d}...")
    for t in ["08:00:00", "10:00:00"]:
        payload = json.dumps({
            "action": "heartbeat",
            "name": "Ganesh",
            "device": "Admin Backfill",
            "time": f"{d}T{t}+05:30"
        }).encode('utf-8')
        
        req = urllib.request.Request(URL, data=payload, headers={'Content-Type': 'text/plain;charset=utf-8'}, method='POST')
        try:
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode('utf-8'))
                print(f"  {t} -> Success")
        except Exception as e:
            print(f"  {t} -> Error: {e}")
        time.sleep(2) # Prevent rate limiting by Google

print("Done!")
