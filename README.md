# ParkLOG

ParkLOG is a thesis prototype for a smart IoT parking availability system. It combines ESP32-WROOM-32 sensor nodes, HC-SR04 ultrasonic sensors, a Node.js/Express + MongoDB backend, and a cross-platform React Native mobile app.

## Repository Layout

```text
parklog/
  backend/   Express API, MongoDB models, Socket.IO live updates, OTA metadata
  frontend/  Expo React Native cross-platform mobile app
  hardware/  ESP32 Arduino firmware and safe device config template
  docs/      One thesis-derived product, backend, frontend, and hardware plan
```

## Stack

- Mobile app: React Native with Expo.
- Backend: Node.js, Express, Socket.IO.
- Database: MongoDB through Mongoose.
- Hardware firmware: Arduino-style ESP32 code using `WiFi.h` and `HTTPClient.h`.

Yes, this stack matches the thesis: Expo/React Native for the cross-platform app and MongoDB for real-time parking data.

## Original Thesis Contract

- Hardware: ESP32-WROOM-32 with 10-15 HC-SR04 sensors per small open parking lot.
- Firmware: polls sensors, debounces readings, buffers during Wi-Fi loss, and posts slot batches.
- Backend: Node.js/Express API with MongoDB storage and real-time updates.
- Mobile: React Native app with map/list views, refresh, offline cached status, and slot alerts.
- OTA: ESP32 checks latest firmware metadata and downloads signed firmware binaries.

## Quick Start

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

For the mobile app:

```bash
cd frontend
npm install
npm start
```

For the ESP32 firmware:

```bash
cd hardware/esp32/parklog_firmware
copy config.example.h config.h
```

Open `parklog_firmware.ino` in Arduino IDE or PlatformIO, fill `config.h`, then flash the ESP32.

See [docs/PARKLOG_FULL_PLAN.md](docs/PARKLOG_FULL_PLAN.md) for the full build plan.
