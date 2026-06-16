import urllib.request
import json

URL = "https://script.google.com/macros/s/AKfycbzywuUrsmIPXprMMUP168OO9pXAFGcXgtVtMSb8TiHQaqAWXZWOzG9zJZ4REtlzdq7s_Q/exec"

# June 13 is a Saturday (already weekend), but also mark any weekday backfill records
# as holiday. June 13 and 14 are Sat/Sun - no action needed for them in backend
# since CalendarView already shows them as Holiday via isWeekend().
# However, the records for June 13 and 14 exist in the sheet and are counted in
# "presentDays" if not marked Holiday. Let's mark them as Holiday in the sheet.

for date in ["2026-06-13", "2026-06-14"]:
    payload = json.dumps({
        "action": "markHoliday",
        "date": date,
        "name": "Ganesh"
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
            print(f"{date} -> {res}")
    except Exception as e:
        print(f"{date} -> Error: {e}")

print("Done!")
