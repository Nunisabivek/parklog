import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { connectSocket, getParkingStatus } from '../api/client';

export const fetchSlots = createAsyncThunk('slots/fetchSlots', async () => {
  return getParkingStatus();
});

const demoSlots = Array.from({ length: 12 }, (_, index) => {
  const slotNumber = index + 1;
  const status = [2, 5, 9].includes(slotNumber) ? 'occupied' : 'vacant';

  return {
    id: slotNumber,
    slotId: `A${slotNumber}`,
    block: 'A',
    status,
    occupied: status === 'occupied',
    lastUpdated: null
  };
});

const initialState = {
  lotId: 'adtu-main',
  slots: demoSlots,
  summary: { total: 12, vacant: 9, occupied: 3, error: 0 },
  loading: false,
  error: null,
  lastUpdatedAt: null,
  subscribedSlotIds: []
};

const slotsSlice = createSlice({
  name: 'slots',
  initialState,
  reducers: {
    liveUpdateReceived(state, action) {
      const changedSlots = action.payload.slots || [];
      const nextById = new Map(state.slots.map(slot => [slot.slotId, slot]));

      changedSlots.forEach(slot => {
        nextById.set(slot.slotId, {
          ...nextById.get(slot.slotId),
          ...slot,
          lastUpdated: slot.lastSeenAt || slot.lastUpdated || slot.updatedAt
        });
      });

      state.slots = Array.from(nextById.values()).sort((a, b) => {
        if (a.block !== b.block) return String(a.block).localeCompare(String(b.block));
        return Number(a.id || a.slotNumber) - Number(b.id || b.slotNumber);
      });
      state.summary = action.payload.summary || state.summary;
      state.lastUpdatedAt = new Date().toISOString();
    },
    toggleSlotSubscription(state, action) {
      const slotId = action.payload;
      const existing = state.subscribedSlotIds.includes(slotId);
      state.subscribedSlotIds = existing
        ? state.subscribedSlotIds.filter(id => id !== slotId)
        : [...state.subscribedSlotIds, slotId];
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSlots.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.lotId = action.payload.lotId;
        state.slots = action.payload.slots;
        state.summary = action.payload.summary;
        state.lastUpdatedAt = new Date().toISOString();
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { liveUpdateReceived, toggleSlotSubscription } = slotsSlice.actions;

export function subscribeToLiveUpdates(dispatch) {
  const socket = connectSocket();

  socket.on('parking:update', payload => {
    dispatch(liveUpdateReceived(payload));
  });

  return () => socket.disconnect();
}

export default slotsSlice.reducer;
