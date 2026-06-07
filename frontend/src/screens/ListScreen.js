import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import StatusPill from '../components/StatusPill';
import { fetchSlots } from '../store/slotsSlice';
import { colors } from '../theme';

export default function ListScreen() {
  const dispatch = useDispatch();
  const { slots, loading } = useSelector(state => state.slots);

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>Slot Status</Text>
        <Pressable
          accessibilityLabel="Refresh slot status"
          onPress={() => dispatch(fetchSlots())}
          style={styles.iconButton}
        >
          <RefreshCw color={colors.ink} size={20} />
        </Pressable>
      </View>
      <FlatList
        data={slots}
        keyExtractor={item => item.slotId}
        refreshing={loading}
        onRefresh={() => dispatch(fetchSlots())}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.slotId}>{item.slotId}</Text>
              <Text style={styles.updated}>
                {item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : 'No reading yet'}
              </Text>
            </View>
            <StatusPill status={item.status} stale={item.stale} />
          </View>
        )}
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
  row: {
    minHeight: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  slotId: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800'
  },
  updated: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12
  }
});
