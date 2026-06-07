# ParkLOG Backend

Node.js/Express backend for ParkLOG with MongoDB persistence, Socket.IO live updates, ESP32 batch ingestion, OTA metadata, and mobile token registration.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## API

### Health

- `GET /health`

### Parking Status

- `GET /api/parking/status?lotId=adtu-main`
- `GET /api/parking/blocks?lotId=adtu-main`

### ESP32 Slot Update

Preferred thesis contract:

```http
POST /api/slot/update
Content-Type: application/json

{
  "device_id": "ESP32-001",
  "timestamp": 1714400000,
  "slots": [
    { "id": 1, "status": 0 },
    { "id": 2, "status": 1 }
  ]
}
```

Legacy one-slot firmware contract is still supported:

```http
POST /api/parking/slot
Content-Type: application/x-www-form-urlencoded

block=A&slotNumber=1&status=occupied&deviceId=A
```

### OTA

- `GET /api/ota/latest`

The response is driven by `OTA_VERSION`, `OTA_URL`, `OTA_CHECKSUM`, and `OTA_REQUIRED`.

### Mobile Tokens

- `POST /api/tokens/register`

```json
{
  "token": "fcm-token",
  "platform": "android",
  "subscribedSlotIds": ["A1", "A2"]
}
```

## Socket.IO

Clients can listen for `parking:update` events to refresh changed slots without polling.
