import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import SummaryStrip from '../components/SummaryStrip';
import { fetchSlots } from '../store/slotsSlice';
import { colors } from '../theme';

function SlotTile({ selected, slot }) {
  const tone =
    slot.status === 'vacant' ? colors.vacant : slot.status === 'occupied' ? colors.occupied : colors.warning;

  return (
    <View style={[styles.slot, { borderColor: tone }, slot.stale ? styles.staleSlot : null, selected ? styles.selectedSlot : null]}>
      <Text style={[styles.slotId, { color: tone }]}>{slot.slotId}</Text>
      <Text style={styles.slotStatus}>{slot.stale ? 'stale' : slot.status}</Text>
    </View>
  );
}

function EmptyLiveState({ loading, onRefresh }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Waiting for parking sensor data</Text>
      <Text style={styles.emptyText}>
        The app will show real slots after the ESP32 posts readings to the backend and MongoDB
        has live records. No placeholder occupancy is shown here.
      </Text>
      <View style={styles.flow}>
        <Text style={styles.flowStep}>Hardware</Text>
        <Text style={styles.flowArrow}>-></Text>
        <Text style={styles.flowStep}>API</Text>
        <Text style={styles.flowArrow}>-></Text>
        <Text style={styles.flowStep}>MongoDB</Text>
        <Text style={styles.flowArrow}>-></Text>
        <Text style={styles.flowStep}>App</Text>
      </View>
      <Pressable accessibilityLabel="Refresh parking data" onPress={onRefresh} style={styles.refreshButton}>
        <RefreshCw color={colors.surface} size={18} />
        <Text style={styles.refreshButtonText}>{loading ? 'Refreshing' : 'Refresh'}</Text>
      </Pressable>
    </View>
  );
}

export default function MapScreen() {
  const dispatch = useDispatch();
  const { slots, summary, loading, error, lastUpdatedAt } = useSelector(state => state.slots);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const selectedSlot = slots.find(slot => slot.slotId === selectedSlotId) || slots[0];
  const refresh = () => dispatch(fetchSlots());

  return (
    <View style={styles.screen}>
      <SummaryStrip summary={summary} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>ADTU Main Lot</Text>
            <Text style={styles.meta}>
              {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleTimeString() : 'No live readings received'}
            </Text>
          </View>
          {loading ? <ActivityIndicator color={colors.occupied} /> : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {slots.length ? (
          <>
            <View style={styles.lot}>
              <View style={styles.slotGrid}>
                {slots.map(slot => (
                  <Pressable
                    key={slot.slotId}
                    accessibilityLabel={`Open ${slot.slotId} details`}
                    onPress={() => setSelectedSlotId(slot.slotId)}
                    style={styles.slotPressable}
                  >
                    <SlotTile selected={slot.slotId === selectedSlot?.slotId} slot={slot} />
                  </Pressable>
                ))}
              </View>
              <View style={styles.lane}>
                <Text style={styles.laneText}>ENTRY</Text>
                <Text style={styles.laneText}>EXIT</Text>
              </View>
            </View>

            {selectedSlot ? (
              <View style={styles.detailPanel}>
                <Text style={styles.detailTitle}>{selectedSlot.slotId}</Text>
                <Text style={styles.detailText}>Status: {selectedSlot.stale ? 'stale reading' : selectedSlot.status}</Text>
                <Text style={styles.detailText}>
                  Last update: {selectedSlot.lastUpdated ? new Date(selectedSlot.lastUpdated).toLocaleString() : 'not received'}
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <EmptyLiveState loading={loading} onRefresh={refresh} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    gap: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800'
  },
  meta: {
    color: colors.muted,
    marginTop: 4
  },
  error: {
    color: colors.occupied,
    fontWeight: '700'
  },
  lot: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    minHeight: 440
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  slotPressable: {
    width: '30.5%',
    aspectRatio: 1.12
  },
  slot: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: colors.slot,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedSlot: {
    backgroundColor: colors.surface
  },
  slotId: {
    fontSize: 18,
    fontWeight: '900'
  },
  slotStatus: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
    textTransform: 'capitalize'
  },
  staleSlot: {
    borderColor: colors.warning,
    borderStyle: 'dashed'
  },
  lane: {
    height: 64,
    marginTop: 18,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: colors.lane,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  laneText: {
    color: colors.surface,
    fontWeight: '800',
    letterSpacing: 0
  },
  detailPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14
  },
  detailTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  detailText: {
    color: colors.muted,
    marginTop: 6
  },
  emptyState: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 18,
    gap: 14
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900'
  },
  emptyText: {
    color: colors.muted,
    lineHeight: 22
  },
  flow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8
  },
  flowStep: {
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontWeight: '700'
  },
  flowArrow: {
    color: colors.muted,
    fontWeight: '900'
  },
  refreshButton: {
    height: 44,
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  refreshButtonText: {
    color: colors.surface,
    fontWeight: '800'
  }
});
