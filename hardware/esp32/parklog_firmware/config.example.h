#pragma once

// Copy this file to config.h and fill in your local values before flashing.
#define WIFI_SSID "Wifi ESSID"
#define WIFI_PASSWORD "Password"

// Local development example: http://192.168.1.10:5000/api/slot/update
// Deployed example: https://your-parklog-api.example.com/api/slot/update
#define PARKLOG_UPDATE_URL "http://192.168.1.10:5000/api/slot/update"

#define PARKLOG_DEVICE_ID "ESP32-001"
#define PARKLOG_LOT_ID "adtu-main"
#define PARKLOG_BLOCK "A"

// Leave empty while REQUIRE_DEVICE_API_KEY=false on the backend.
// In production, set REQUIRE_DEVICE_API_KEY=true and paste the same key here.
#define PARKLOG_DEVICE_API_KEY ""

// Distance threshold from thesis prototype: below 50 cm means occupied.
#define OCCUPIED_THRESHOLD_CM 50

// Keep this modest during tests; thesis target was every 5-10 seconds.
#define POST_INTERVAL_MS 5000
