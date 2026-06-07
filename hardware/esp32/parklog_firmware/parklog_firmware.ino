#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>

#include "config.h"

struct SensorSlot {
  uint8_t slotNumber;
  uint8_t trigPin;
  uint8_t echoPin;
};

// Thesis appendix used GPIO 2/4 and 5/18 for the first two HC-SR04 sensors.
// Extend this array for 10-15 slots after confirming available ESP32 pins.
SensorSlot slots[] = {
  {1, 2, 4},
  {2, 5, 18}
};

const size_t slotCount = sizeof(slots) / sizeof(slots[0]);
unsigned long lastPostAt = 0;

void setup() {
  Serial.begin(115200);

  for (size_t i = 0; i < slotCount; i++) {
    pinMode(slots[i].trigPin, OUTPUT);
    pinMode(slots[i].echoPin, INPUT);
  }

  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (millis() - lastPostAt >= POST_INTERVAL_MS) {
    postBatch();
    lastPostAt = millis();
  }
}

void connectWiFi() {
  Serial.printf("Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint8_t attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi connected: %s\n", WiFi.localIP().toString().c_str());
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  } else {
    Serial.println("\nWiFi connection failed; retrying later");
  }
}

void swapLong(long &left, long &right) {
  long temp = left;
  left = right;
  right = temp;
}

long readDistanceCm(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 25000);
  long distance = duration * 0.034 / 2;

  if (duration == 0 || distance <= 0 || distance > 400) {
    return 999;
  }

  return distance;
}

long medianDistanceCm(uint8_t trigPin, uint8_t echoPin) {
  long readings[3];

  for (uint8_t i = 0; i < 3; i++) {
    readings[i] = readDistanceCm(trigPin, echoPin);
    delay(60);
  }

  if (readings[0] > readings[1]) swapLong(readings[0], readings[1]);
  if (readings[1] > readings[2]) swapLong(readings[1], readings[2]);
  if (readings[0] > readings[1]) swapLong(readings[0], readings[1]);

  return readings[1];
}

int statusFromDistance(long distanceCm) {
  if (distanceCm == 999) {
    return -1;
  }

  return distanceCm < OCCUPIED_THRESHOLD_CM ? 1 : 0;
}

long currentTimestamp() {
  time_t now = time(nullptr);

  if (now < 1700000000) {
    return 0;
  }

  return now;
}

void postBatch() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Skipping post; WiFi disconnected");
    return;
  }

  String body = "{";
  body += "\"device_id\":\"" + String(PARKLOG_DEVICE_ID) + "\",";
  body += "\"lotId\":\"" + String(PARKLOG_LOT_ID) + "\",";
  body += "\"timestamp\":" + String(currentTimestamp()) + ",";
  body += "\"slots\":[";

  for (size_t i = 0; i < slotCount; i++) {
    long distance = medianDistanceCm(slots[i].trigPin, slots[i].echoPin);
    int status = statusFromDistance(distance);

    if (i > 0) {
      body += ",";
    }

    body += "{";
    body += "\"block\":\"" + String(PARKLOG_BLOCK) + "\",";
    body += "\"id\":" + String(slots[i].slotNumber) + ",";

    if (status == -1) {
      body += "\"status\":\"error\"";
    } else {
      body += "\"status\":" + String(status);
    }

    body += "}";

    Serial.printf(
      "Slot %s%d distance=%ldcm status=%s\n",
      PARKLOG_BLOCK,
      slots[i].slotNumber,
      distance,
      status == 1 ? "occupied" : status == 0 ? "vacant" : "error"
    );

    delay(100);
  }

  body += "]}";

  HTTPClient http;
  http.begin(PARKLOG_UPDATE_URL);
  http.addHeader("Content-Type", "application/json");

  if (String(PARKLOG_DEVICE_API_KEY).length() > 0) {
    http.addHeader("x-device-key", PARKLOG_DEVICE_API_KEY);
  }

  int responseCode = http.POST(body);
  Serial.printf("POST /api/slot/update -> HTTP %d\n", responseCode);
  http.end();
}
