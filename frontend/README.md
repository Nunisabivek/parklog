# ParkLOG Mobile

Expo React Native scaffold for the ParkLOG mobile app described in the thesis.

## Setup

```bash
npm install
npm start
```

Use these environment variables when running against a deployed backend:

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-api.example.com
EXPO_PUBLIC_LOT_ID=adtu-main
```

## Current Screens

- `Map`: status summary and schematic parking lot map.
- `List`: slot-by-slot status with manual refresh.
- `Alerts`: slot vacancy subscription toggles.

## Next Mobile Work

- Replace `development-token` with Expo Notifications or Firebase Cloud Messaging token registration.
- Add captive portal/BLE Wi-Fi provisioning screens for the ESP32.
- Replace the schematic lot with `react-native-maps` when actual lot coordinates are available.
- Add local persistence for cached last-known status.
