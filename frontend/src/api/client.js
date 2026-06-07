import { io } from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const LOT_ID = process.env.EXPO_PUBLIC_LOT_ID || 'adtu-main';

export async function getParkingStatus() {
  const response = await fetch(`${API_BASE_URL}/api/parking/status?lotId=${LOT_ID}`);

  if (!response.ok) {
    throw new Error('Unable to load parking status');
  }

  return response.json();
}

export async function registerToken(payload) {
  const response = await fetch(`${API_BASE_URL}/api/tokens/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, lotId: LOT_ID })
  });

  if (!response.ok) {
    throw new Error('Unable to save alert settings');
  }

  return response.json();
}

export function connectSocket() {
  return io(API_BASE_URL, {
    transports: ['websocket'],
    reconnection: true
  });
}
