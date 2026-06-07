import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Save } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { toggleSlotSubscription } from '../store/slotsSlice';
import { colors } from '../theme';

export default function AlertsScreen() {
  const dispatch = useDispatch();
  const { slots, subscribedSlotIds } = useSelector(state => state.slots);
  const [message, setMessage] = useState('Select slots to prepare vacancy alerts on this device.');

  function save() {
    setMessage(
      subscribedSlotIds.length
        ? 'Selections saved locally. Push delivery needs Expo Notifications or FCM token setup.'
        : 'No slots selected yet.'
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>Vacancy Alerts</Text>
        <Pressable accessibilityLabel="Save alert settings" onPress={save} style={styles.iconButton}>
          <Save color={colors.ink} size={20} />
        </Pressable>
      </View>
      <Text style={styles.message}>{message}</Text>
      <FlatList
        data={slots}
        keyExtractor={item => item.slotId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No alertable slots</Text>
            <Text style={styles.emptyText}>
              Vacancy alerts become available after live slot records are created by the backend.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const enabled = subscribedSlotIds.includes(item.slotId);
          return (
            <View style={styles.row}>
              <View>
                <Text style={styles.slotId}>{item.slotId}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={() => dispatch(toggleSlotSubscription(item.slotId))}
                trackColor={{ false: colors.border, true: colors.vacant }}
                thumbColor={colors.surface}
              />
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  toolbar: {
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800'
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface
  },
  list: {
    padding: 12,
    gap: 10
  },
  message: {
    color: colors.muted,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 20
  },
  row: {
    minHeight: 68,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  slotId: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800'
  },
  status: {
    color: colors.muted,
    marginTop: 4,
    textTransform: 'capitalize'
  },
  emptyState: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  emptyText: {
    color: colors.muted,
    marginTop: 6,
    lineHeight: 21
  }
});
