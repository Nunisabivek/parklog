import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import SummaryStrip from '../components/SummaryStrip';
import { fetchSlots } from '../store/slotsSlice';
import { colors } from '../theme';

function SlotTile({ slot }) {
  const tone =
    slot.status === 'vacant' ? colors.vacant : slot.status === 'occupied' ? colors.occupied : colors.warning;

  return (
    <View style={[styles.slot, { borderColor: tone }, slot.stale ? styles.staleSlot : null]}>
      <Text style={[styles.slotId, { color: tone }]}>{slot.slotId}</Text>
      <Text style={styles.slotStatus}>{slot.stale ? 'stale' : slot.status}</Text>
    </View>
  );
}

export default function MapScreen() {
  const dispatch = useDispatch();
  const { slots, summary, loading, error, lastUpdatedAt } = useSelector(state => state.slots);

  return (
    <View style={styles.screen}>
      <SummaryStrip summary={summary} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchSlots())} />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>ADTU Main Lot</Text>
            <Text style={styles.meta}>
              {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleTimeString() : 'Waiting for data'}
            </Text>
          </View>
          {loading ? <ActivityIndicator color={colors.occupied} /> : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.lot}>
          <View style={styles.slotGrid}>
            {slots.map(slot => (
              <SlotTile key={slot.slotId} slot={slot} />
            ))}
          </View>
          <View style={styles.lane}>
            <Text style={styles.laneText}>ENTRY</Text>
            <Text style={styles.laneText}>EXIT</Text>
          </View>
        </View>
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
  slot: {
    width: '30.5%',
    aspectRatio: 1.12,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: colors.slot,
    justifyContent: 'center',
    alignItems: 'center'
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
  }
});
