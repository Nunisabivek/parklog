import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const items = [
  ['vacant', 'Vacant', colors.vacant],
  ['occupied', 'Occupied', colors.occupied],
  ['error', 'Fault', colors.warning]
];

export default function SummaryStrip({ summary }) {
  return (
    <View style={styles.wrap}>
      {items.map(([key, label, color]) => (
        <View key={key} style={styles.item}>
          <Text style={[styles.value, { color }]}>{summary?.[key] ?? 0}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  item: {
    flex: 1,
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: colors.border
  },
  value: {
    fontSize: 28,
    fontWeight: '800'
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3
  }
});
