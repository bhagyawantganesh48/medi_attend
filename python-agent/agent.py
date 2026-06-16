"""
Smart Internship Attendance Tracker — Python Agent
===================================================

Runs in the background on Windows. Every 60 seconds:
  1. Detects the current WiFi SSID
  2. If SSID matches COMPANY_WIFI → sends a heartbeat POST to Google Apps Script
  3. Logs all activity to a local log file

Usage:
  python agent.py          → Run normally
  python agent.py --test   → Test WiFi detection and API connection, then exit

Auto-start: Use install.bat to register as a Windows Task Scheduler job.
"""

import sys
import time
import json
import logging
import argparse
import subprocess
import platform
from datetime import datetime, timezone
from logging.handlers import TimedRotatingFileHandler

import requests

import config  # Import local config.py

# ─────────────────────────────────────────────
# LOGGING SETUP
# ─────────────────────────────────────────────

def setup_logging():
    """Configure logging to both console and rotating file."""
    logger = logging.getLogger("AttendanceAgent")
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    # Rotating file handler (new file each day, keep 7 days)
    file_handler = TimedRotatingFileHandler(
        config.LOG_FILE,
        when="midnight",
        interval=1,
        backupCount=7,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger


logger = setup_logging()

# ─────────────────────────────────────────────
# WIFI DETECTION
# ─────────────────────────────────────────────

def get_current_ssid() -> str | None:
    """
    Detect the current WiFi SSID on Windows.
    Returns the SSID string or None if not connected / detection failed.
    """
    system = platform.system()

    try:
        if system == "Windows":
            # Use 'netsh wlan show interfaces' — works on all Windows versions
            result = subprocess.run(
                ["netsh", "wlan", "show", "interfaces"],
                capture_output=True,
                text=True,
                timeout=10,
                encoding="utf-8",
                errors="replace",
            )
            output = result.stdout

            for line in output.splitlines():
                line = line.strip()
                # Look for the SSID line (not BSSID)
                if line.startswith("SSID") and "BSSID" not in line:
                    parts = line.split(":", 1)
                    if len(parts) == 2:
                        return parts[1].strip()

        elif system == "Darwin":  # macOS (for development/testing)
            result = subprocess.run(
                ["/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport", "-I"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            for line in result.stdout.splitlines():
                if " SSID:" in line:
                    return line.split("SSID:", 1)[1].strip()

        elif system == "Linux":  # Linux (for development/testing)
            result = subprocess.run(
                ["iwgetid", "-r"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            return result.stdout.strip() or None

    except subprocess.TimeoutExpired:
        logger.warning("WiFi detection timed out.")
    except FileNotFoundError as e:
        logger.warning(f"WiFi detection command not found: {e}")
    except Exception as e:
        logger.error(f"Unexpected error detecting WiFi: {e}")

    return None


def is_on_company_wifi() -> bool:
    """Returns True if the current SSID matches the configured company WiFi."""
    ssid = get_current_ssid()
    logger.debug(f"Current SSID: {ssid!r} | Expected: {config.COMPANY_WIFI!r}")

    if ssid is None:
        return False

    return ssid.strip() == config.COMPANY_WIFI.strip()


# ─────────────────────────────────────────────
# API COMMUNICATION
# ─────────────────────────────────────────────

def send_heartbeat() -> bool:
    """
    Send a POST request to the Google Apps Script API with the current time.
    Returns True on success, False on failure.
    """
    now_iso = datetime.now().astimezone().isoformat()  # Local time with timezone offset

    payload = {
        "action": "heartbeat",
        "name": config.USER_NAME,
        "device": config.DEVICE_NAME,
        "time": now_iso,
    }

    try:
        response = requests.post(
            config.API_URL,
            json=payload,
            timeout=30,
            headers={"Content-Type": "application/json"},
        )
        response.raise_for_status()

        data = response.json()

        if data.get("success"):
            action = data.get("action", "unknown")
            message = data.get("message", "")
            logger.info(f"[OK] Heartbeat OK [{action}]: {message}")
            return True
        else:
            logger.warning(f"[!!] API returned error: {data.get('error', 'Unknown error')}")
            return False

    except requests.exceptions.ConnectionError:
        logger.error("[ERR] Connection error - check your internet connection or API URL.")
    except requests.exceptions.Timeout:
        logger.error("[ERR] Request timed out - API did not respond within 30 seconds.")
    except requests.exceptions.HTTPError as e:
        logger.error(f"[ERR] HTTP error: {e}")
    except json.JSONDecodeError:
        logger.error(f"[ERR] API returned invalid JSON. Response: {response.text[:200]}")
    except Exception as e:
        logger.error(f"[ERR] Unexpected error sending heartbeat: {e}")

    return False


# ─────────────────────────────────────────────
# TEST MODE
# ─────────────────────────────────────────────

def run_test():
    """Run a connectivity test and exit."""
    print("\n" + "=" * 50)
    print("  Attendance Agent — Connection Test")
    print("=" * 50)

    # Test 1: WiFi detection
    ssid = get_current_ssid()
    print(f"\n[1] Current WiFi SSID : {ssid!r}")
    print(f"    Target SSID        : {config.COMPANY_WIFI!r}")
    if ssid == config.COMPANY_WIFI:
        print("    Result             : [OK] MATCH - on company WiFi")
    else:
        print("    Result             : [!!] NO MATCH - not on company WiFi")
        print("           (Heartbeat will still be sent for testing)")

    # Test 2: API connectivity
    print(f"[2] API URL: {config.API_URL}")
    if "YOUR_SCRIPT_ID" in config.API_URL:
        print("    Result: [FAIL] API URL not configured. Update config.py first.")
        sys.exit(1)

    print("    Sending test heartbeat...")
    success = send_heartbeat()

    if success:
        print("    Result: [OK] API is reachable and working!")
    else:
        print("    Result: [FAIL] API call failed. Check the URL and Apps Script deployment.")

    print("\n" + "=" * 50 + "\n")
    sys.exit(0 if success else 1)


# ─────────────────────────────────────────────
# MAIN LOOP
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Attendance Agent")
    parser.add_argument("--test", action="store_true", help="Run connection test and exit")
    args = parser.parse_args()

    if args.test:
        run_test()

    # Validate config before starting
    if "YOUR_SCRIPT_ID" in config.API_URL:
        logger.error("❌ API_URL is not configured. Edit python-agent/config.py and set your Apps Script URL.")
        sys.exit(1)

    logger.info("=" * 50)
    logger.info("  Smart Internship Attendance Agent Started")
    logger.info(f"  User   : {config.USER_NAME}")
    logger.info(f"  Device : {config.DEVICE_NAME}")
    logger.info(f"  WiFi   : {config.COMPANY_WIFI}")
    logger.info(f"  Interval: {config.HEARTBEAT_INTERVAL_SECONDS}s")
    logger.info("=" * 50)

    while True:
        try:
            if is_on_company_wifi():
                logger.info(f"[WiFi] Connected to '{config.COMPANY_WIFI}' - sending heartbeat...")
                send_heartbeat()
            else:
                ssid = get_current_ssid()
                if ssid:
                    logger.info(f"[WiFi] Connected to '{ssid}' (not company WiFi) - skipping.")
                else:
                    logger.info("[WiFi] Not connected to any WiFi - skipping.")

        except KeyboardInterrupt:
            logger.info("\nAgent stopped by user.")
            break
        except Exception as e:
            logger.error(f"Unexpected error in main loop: {e}")

        time.sleep(config.HEARTBEAT_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
