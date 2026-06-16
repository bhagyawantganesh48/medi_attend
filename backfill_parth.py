import urllib.request
import json
import time

URL = "https://script.google.com/macros/s/AKfycbzywuUrsmIPXprMMUP168OO9pXAFGcXgtVtMSb8TiHQaqAWXZWOzG9zJZ4REtlzdq7s_Q/exec"

# Parth's working days (same as Ganesh):
# June 11 (Wed), June 12 (Thu) - Working days
# June 13 (Sat) - Weekend Holiday, June 14 (Sun) - Weekend Holiday
# June 15 (Mon), June 16 (Tue) - Working days
working_days = ["2026-06-11", "2026-06-12", "2026-06-15", "2026-06-16"]

print("Backfilling attendance for Parth...")

for d in working_days:
    print(f"  Backfilling {d}...")
    for t in ["08:00:00", "10:00:00"]:
        payload = json.dumps({
            "action": "heartbeat",
            "name": "Parth",
            "device": "Admin Backfill",
            "time": f"{d}T{t}+05:30"
        }).encode('utf-8')

        req = urllib.request.Request(
            URL,
            data=payload,
            headers={'Content-Type': 'text/plain;charset=utf-8'},
            method='POST'
        )
        try:
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode('utf-8'))
                print(f"    {t} -> {res.get('action', 'ok')}")
        except Exception as e:
            print(f"    {t} -> Error: {e}")
        time.sleep(2)

print("Done! Parth now has 4 days of attendance.")
