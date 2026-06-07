# ParkLOG Full Build Plan

## 1. Recovered Product Context

ParkLOG is a smart IoT parking availability monitoring system for small open parking lots, especially campus-style lots with 10-15 spaces. The thesis prototype used:

- ESP32-WROOM-32 microcontroller.
- HC-SR04 ultrasonic sensors for vehicle detection.
- Wi-Fi HTTP communication from device to backend.
- Node.js/Express backend with MongoDB.
- React Native mobile app with map/list status views.
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

### Mobile App

- Cross-platform React Native/Expo app.
- First screen should be the live parking experience, not a landing page.
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
  docs/
    PARKLOG_FULL_PLAN.md
```

## 4. Backend API Contract

### Health

`GET /health`

Returns backend health and uptime.

### ESP32 Batch Update

`POST /api/slot/update`

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

### Screens

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
