import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Activity, Cpu, Database, RefreshCw, Smartphone, Wifi } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { fetchSlots } from '../store/slotsSlice';
import { colors } from '../theme';

const stack = [
  ['ESP32', 'HC-SR04 sensors, median filtering, JSON batch posts', Cpu],
  ['Express API', 'slot ingestion, stale detection, Socket.IO events', Activity],
  ['MongoDB', 'current state, device health, occupancy history', Database],
  ['Expo app', 'mobile lot map, slot list, vacancy subscriptions', Smartphone]
];

const setup = [
  'Clone repo and copy backend/.env.example to backend/.env',
  'Set MONGO_URI to local MongoDB or MongoDB Atlas',
  'Run npm install, npm run seed, then npm run dev in backend',
  'Copy frontend/.env.example and set EXPO_PUBLIC_API_BASE_URL',
  'Copy hardware config.example.h to config.h before flashing ESP32'
];

function StatusDot({ status }) {
  const tone =
    status === 'vacant' ? colors.vacant : status === 'occupied' ? colors.occupied : colors.warning;
  return <View style={[styles.statusDot, { backgroundColor: tone }]} />;
}

function WebSlot({ slot }) {
  const tone =
    slot.status === 'vacant' ? colors.vacant : slot.status === 'occupied' ? colors.occupied : colors.warning;

  return (
    <View style={[styles.webSlot, slot.stale ? styles.staleSlot : { borderColor: tone }]}>
      <Text style={[styles.webSlotId, { color: tone }]}>{slot.slotId}</Text>
      <Text style={styles.webSlotStatus}>{slot.stale ? 'stale' : slot.status}</Text>
    </View>
  );
}

function Metric({ label, value, tone }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: tone }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function WebHomeScreen() {
  const dispatch = useDispatch();
  const { slots, summary, loading, error, lastUpdatedAt } = useSelector(state => state.slots);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.nav}>
        <Text style={styles.brand}>ParkLOG</Text>
        <Text style={styles.navMeta}>IoT parking monitor for small open lots</Text>
      </View>

      <View style={styles.firstViewport}>
        <View style={styles.copyColumn}>
          <Text style={styles.kicker}>Thesis prototype to startup codebase</Text>
          <Text style={styles.headline}>A working parking status system, from ESP32 sensor to visitor screen.</Text>
          <Text style={styles.lede}>
            Built around the original stack: ESP32-WROOM-32, HC-SR04 ultrasonic sensors,
            Express, MongoDB, Socket.IO, and Expo React Native.
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Refresh live parking data"
              onPress={() => dispatch(fetchSlots())}
              style={styles.primaryAction}
            >
              <RefreshCw color={colors.surface} size={18} />
              <Text style={styles.primaryActionText}>{loading ? 'Refreshing' : 'Refresh Lot'}</Text>
            </Pressable>
            <View style={styles.connection}>
              <Wifi color={error ? colors.warning : colors.vacant} size={18} />
              <Text style={styles.connectionText}>{error ? 'Demo data shown' : 'Backend ready'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.board}>
          <View style={styles.boardHeader}>
            <View>
              <Text style={styles.boardTitle}>ADTU Main Lot</Text>
              <Text style={styles.boardMeta}>
                {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString() : 'Seeded demo layout'}
              </Text>
            </View>
            <Text style={styles.boardBadge}>{summary.total} slots</Text>
          </View>

          <View style={styles.metrics}>
            <Metric label="Vacant" value={summary.vacant} tone={colors.vacant} />
            <Metric label="Occupied" value={summary.occupied} tone={colors.occupied} />
            <Metric label="Fault" value={summary.error} tone={colors.warning} />
          </View>

          <View style={styles.slotBoard}>
            {slots.map(slot => (
              <WebSlot key={slot.slotId} slot={slot} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Path</Text>
        <View style={styles.stackGrid}>
          {stack.map(([title, body, Icon]) => (
            <View key={title} style={styles.stackItem}>
              <Icon color={colors.ink} size={22} />
              <Text style={styles.stackTitle}>{title}</Text>
              <Text style={styles.stackBody}>{body}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clone And Run</Text>
        <View style={styles.setupList}>
          {setup.map((item, index) => (
            <View key={item} style={styles.setupRow}>
              <Text style={styles.setupNumber}>{index + 1}</Text>
              <Text style={styles.setupText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <StatusDot status="vacant" />
        <Text style={styles.footerText}>Designed for 10-15 slot campus lots, scalable to multi-lot deployments.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background
  },
  pageContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center'
  },
  nav: {
    minHeight: 72,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  brand: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900'
  },
  navMeta: {
    color: colors.muted,
    fontSize: 14
  },
  firstViewport: {
    minHeight: 620,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 28,
    alignItems: 'center',
    paddingVertical: 34
  },
  copyColumn: {
    flex: 1,
    minWidth: 280
  },
  kicker: {
    color: colors.occupied,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  headline: {
    color: colors.ink,
    fontSize: 42,
    lineHeight: 49,
    fontWeight: '900',
    marginTop: 16,
    maxWidth: 620
  },
  lede: {
    color: colors.muted,
    fontSize: 18,
    lineHeight: 29,
    marginTop: 18,
    maxWidth: 640
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 28,
    flexWrap: 'wrap'
  },
  primaryAction: {
    height: 46,
    borderRadius: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.ink
  },
  primaryActionText: {
    color: colors.surface,
    fontWeight: '800'
  },
  connection: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface
  },
  connectionText: {
    color: colors.ink,
    fontWeight: '700'
  },
  board: {
    flex: 1,
    minWidth: 280,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18
  },
  boardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  boardTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900'
  },
  boardMeta: {
    color: colors.muted,
    marginTop: 4
  },
  boardBadge: {
    color: colors.ink,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  metrics: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 18
  },
  metric: {
    flex: 1,
    minHeight: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: colors.border
  },
  metricValue: {
    fontSize: 30,
    fontWeight: '900'
  },
  metricLabel: {
    color: colors.muted,
    marginTop: 3
  },
  slotBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18
  },
  webSlot: {
    width: '22.5%',
    minWidth: 74,
    aspectRatio: 1.08,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: colors.slot,
    alignItems: 'center',
    justifyContent: 'center'
  },
  staleSlot: {
    borderColor: colors.warning,
    borderStyle: 'dashed'
  },
  webSlotId: {
    fontSize: 18,
    fontWeight: '900'
  },
  webSlotStatus: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12,
    textTransform: 'capitalize'
  },
  section: {
    paddingVertical: 30,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 16
  },
  stackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  stackItem: {
    flexGrow: 1,
    flexBasis: 250,
    minHeight: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16
  },
  stackTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 12
  },
  stackBody: {
    color: colors.muted,
    lineHeight: 21,
    marginTop: 8
  },
  setupList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  setupRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  setupNumber: {
    width: 28,
    color: colors.occupied,
    fontWeight: '900'
  },
  setupText: {
    color: colors.ink,
    flex: 1,
    lineHeight: 21
  },
  footer: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  footerText: {
    color: colors.muted
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  }
});
