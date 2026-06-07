# ParkLOG Full Build Plan

## 1. Recovered Product Context

ParkLOG is a smart IoT parking availability monitoring system for small open parking lots, especially campus-style lots with 10-15 spaces. The thesis prototype used:

- ESP32-WROOM-32 microcontroller.
- HC-SR04 ultrasonic sensors for vehicle detection.
- Wi-Fi HTTP communication from device to backend.
- Node.js/Express backend with MongoDB.
- React Native frontend built with Expo for website, iOS, and Android.
- OTA firmware metadata endpoint for ESP32 updates.

The target user is a visitor who wants to quickly find a vacant slot. A future administrator can manage slots, view analytics, and trigger OTA releases.

## 2. Core Requirements From Thesis

### Hardware/Firmware

- Poll each ultrasonic sensor sequentially to avoid echo crosstalk.
- Use median filtering over repeated readings.
- Convert distance readings to slot status:
  - `0` or `vacant`: no car detected.
  - `1` or `occupied`: car detected.
  - `error`: sensor fault or unreliable reading.
- Post readings every 5-10 seconds.
- Retry failed HTTP posts up to 3 times with backoff.
- Buffer recent readings locally during Wi-Fi loss.
- Check OTA metadata at `/api/ota/latest`.

### Backend

- Accept ESP32 batch payloads.
- Store latest slot state in MongoDB.
- Store device last-seen metadata.
- Store occupancy events when a slot changes state.
- Return all current slots to the mobile app.
- Emit live updates through Socket.IO.
- Keep legacy one-slot firmware route working.

### Frontend App And Website

- Cross-platform React Native/Expo codebase.
- Web opens to a polished product and operations page with the live lot board.
- iOS/Android open to mobile lot map, list, and alert tabs.
- The first screen should show concrete parking status, not a generic marketing page.
- Map/schematic slot view with color-coded status.
- List view with manual refresh.
- Vacancy alert subscriptions.
- Poll backend every 10 seconds or listen to live updates.
- Cache last-known status when offline.

## 3. Repository Plan

```text
parklog/
  backend/
    src/
      app.js
      server.js
      config/
      controllers/
      models/
      routes/
      services/
  frontend/
    App.js
    src/
      api/
      components/
      screens/
      store/
  hardware/
    esp32/
      parklog_firmware/
        config.example.h
        parklog_firmware.ino
  docs/
    PARKLOG_FULL_PLAN.md
```

## 3.1 Does This Stack Work Together?

Yes. This is the intended thesis stack:

1. The ESP32 reads HC-SR04 ultrasonic sensor distances.
2. Firmware converts each distance to `vacant`, `occupied`, or `error`.
3. ESP32 posts a JSON batch to the Express backend.
4. Express validates the payload and writes the latest slot states to MongoDB.
5. MongoDB stores current slot status, device metadata, and historical occupancy events.
6. Socket.IO emits changed slots to the Expo React Native app.
7. The mobile app also polls `GET /api/parking/status` so it still works if live sockets fail.

The only pieces that still need real deployment configuration are the MongoDB connection string, backend host URL, and ESP32 Wi-Fi credentials.

## 3.2 New Developer Runbook

Docker path:

```bash
docker compose up
cd backend
npm install
npm run seed
```

Manual path:

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Frontend web:

```bash
cd frontend
cp .env.example .env
npm install
npm run web
```

Hardware:

```bash
cd hardware/esp32/parklog_firmware
copy config.example.h config.h
```

Fill `config.h`, flash `parklog_firmware.ino`, and point `PARKLOG_UPDATE_URL` to `/api/slot/update`.
If `REQUIRE_DEVICE_API_KEY=true`, set `PARKLOG_DEVICE_API_KEY` in firmware to the backend `DEVICE_API_KEY`.

## 4. Backend API Contract

### Health

`GET /health`

Returns backend health and uptime.

### ESP32 Batch Update

`POST /api/slot/update`

Production device writes can be protected with `REQUIRE_DEVICE_API_KEY=true` and an `x-device-key` header.

```json
{
  "device_id": "ESP32-001",
  "timestamp": 1714400000,
  "slots": [
    { "id": 1, "status": 0 },
    { "id": 2, "status": 1 }
  ]
}
```

Response:

```json
{
  "success": true,
  "lotId": "adtu-main",
  "deviceId": "ESP32-001",
  "updatedCount": 2,
  "changedCount": 1,
  "summary": {
    "total": 2,
    "vacant": 1,
    "occupied": 1,
    "error": 0
  }
}
```

### Legacy Slot Update

`POST /api/parking/slot`

Supports old firmware form payload:

```text
block=A&slotNumber=1&status=occupied&deviceId=A
```

### Mobile Status

`GET /api/parking/status?lotId=adtu-main`

Returns:

```json
{
  "lotId": "adtu-main",
  "summary": {
    "total": 15,
    "vacant": 8,
    "occupied": 7,
    "error": 0
  },
  "slots": [
    {
      "id": 1,
      "slotId": "A1",
      "block": "A",
      "status": "vacant",
      "occupied": false,
      "stale": false,
      "ageSeconds": 4,
      "lastUpdated": "2026-06-07T15:30:00.000Z"
    }
  ]
}
```

### Block Summary

`GET /api/parking/blocks?lotId=adtu-main`

Returns per-block totals.

### OTA

`GET /api/ota/latest`

Returns:

```json
{
  "version": "0.0.0",
  "url": null,
  "checksum": null,
  "required": false
}
```

### Token Registration

`POST /api/tokens/register`

```json
{
  "token": "fcm-or-expo-token",
  "platform": "android",
  "subscribedSlotIds": ["A1", "A2"]
}
```

## 5. MongoDB Collections

### ParkingSlot

- `lotId`
- `block`
- `slotNumber`
- `slotId`
- `status`: `vacant`, `occupied`, `error`
- `deviceId`
- `lastSeenAt`
- timestamps

### Device

- `deviceId`
- `lotId`
- `firmwareVersion`
- `lastIp`
- `lastSeenAt`
- timestamps

### OccupancyEvent

- `lotId`
- `slotId`
- `previousStatus`
- `nextStatus`
- `deviceId`
- `observedAt`
- timestamps

### UserToken

- `token`
- `platform`
- `lotId`
- `subscribedSlotIds`
- `lastSeenAt`
- timestamps

## 6. Frontend Plan

### Web Surface

- `WebHomeScreen`: website-grade product page with a live lot board, concrete setup steps, and the actual hardware/backend/mobile system path.
- Avoid generic AI-style visuals: no abstract gradient hero, no filler claims, no decorative blobs. Use real thesis specifics, operational copy, and parking status data.
- The web page should help a visitor, investor, or developer understand what ParkLOG does in under a minute.

### Native Screens

- `Map`: summary strip and parking lot schematic. Later replace with `react-native-maps` if exact coordinates are collected.
- `List`: FlatList of slots with last update times and status badges.
- `Alerts`: toggles for vacancy alerts per slot.
- Later `Provisioning`: Wi-Fi captive portal or BLE setup for ESP32.
- Later `Admin`: add/remove slots, device health, OTA release controls, analytics.

### State

- Redux Toolkit slice for slot data.
- Fetch `GET /api/parking/status` on launch and pull-to-refresh.
- Listen to Socket.IO `parking:update` for changed slots.
- Store alert subscriptions locally and register them with backend.

### Mobile UX

- Green: vacant.
- Red: occupied.
- Amber: error/fault.
- Show stale readings clearly once a slot has not updated for a configured timeout.
- Keep controls thumb-friendly and status-dense.

## 6.1 Scalability Notes

- Multi-lot support already starts with `lotId`.
- Slot ids are unique per lot through `{ lotId, slotId }`.
- Current state and event history are separate collections so analytics can grow without slowing status reads.
- Backend stays stateless except MongoDB, so it can run behind a load balancer later.
- Socket.IO works for prototype live updates. For multi-server deployments, add a Redis adapter or move device ingest to MQTT.
- Device writes should use `REQUIRE_DEVICE_API_KEY=true` before any public deployment.
- Configure `CORS_ORIGIN` to the deployed website/app origins instead of `*`.

## 7. Hardware Integration Plan

1. Confirm sensor pin map for 10-15 HC-SR04 sensors.
2. Use voltage divider or level shifter for ECHO pins because ESP32 GPIO is 3.3 V.
3. Poll sensors sequentially, not simultaneously.
4. Use 3 readings per sensor and median filter.
5. Send one batch payload per cycle:

```json
{
  "device_id": "ESP32-001",
  "timestamp": 1714400000,
  "slots": [
    { "id": 1, "status": 0 },
    { "id": 2, "status": 1 }
  ]
}
```

6. Add retry queue for Wi-Fi loss.
7. Add OTA metadata check:
   - call `/api/ota/latest`
   - compare version
   - verify checksum
   - download firmware from `url`

### Hardware Workspace

Use `hardware/esp32/parklog_firmware/` for device code.

- `config.example.h`: safe template for Wi-Fi, backend URL, device id, lot id, and threshold.
- `config.h`: local private file copied from the example and ignored by Git.
- `parklog_firmware.ino`: Arduino IDE compatible ESP32 firmware based on the thesis appendix.

The current firmware keeps the thesis GPIO examples:

| Slot | TRIG | ECHO |
| --- | ---: | ---: |
| A1 | 2 | 4 |
| A2 | 5 | 18 |

Extend the `slots[]` array after confirming the final ESP32 pin map for 10-15 sensors. ECHO pins must go through a divider or level shifter because HC-SR04 ECHO is 5 V and ESP32 GPIO is 3.3 V.

## 8. Immediate Next Improvements

1. Add MongoDB integration tests using a test database or mongodb-memory-server.
2. Add authentication for admin-only endpoints before creating admin dashboard.
3. Add request signing or API key protection for ESP32 update endpoint.
4. Add stale sensor detection job.
5. Add push notification worker for occupied-to-vacant transitions.
6. Deploy backend to Render/Railway/Fly.io and MongoDB Atlas.
7. Build Firebase or Expo Notifications into the mobile app.
8. Add an admin dashboard for lots, slots, devices, OTA versions, and occupancy analytics.

## 9. Codex Prompt To Continue Building

Use this prompt in a fresh Codex session:

```text
You are working on ParkLOG, an IoT smart parking monorepo. Read docs/PARKLOG_FULL_PLAN.md first. The backend is Node.js/Express/MongoDB in backend/. The frontend is Expo React Native in frontend/. Continue from the existing code, keep the ESP32 thesis contract POST /api/slot/update, and do not remove legacy POST /api/parking/slot support. Implement the next production pass:

1. Add backend integration tests using a disposable MongoDB test database.
2. Add API-key auth for ESP32 device writes.
3. Add stale-slot detection and return stale=true when lastSeenAt is older than a configured threshold.
4. Replace the frontend development token with Expo Notifications token registration.
5. Add cached offline slot status in the frontend.
6. Update docs and run all tests.
```
