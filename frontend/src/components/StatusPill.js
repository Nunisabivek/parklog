import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function StatusPill({ status, stale }) {
  const tone =
    stale ? colors.warning : status === 'vacant' ? colors.vacant : status === 'occupied' ? colors.occupied : colors.warning;

  return (
    <View style={[styles.pill, { borderColor: tone }]}>
      <View style={[styles.dot, { backgroundColor: tone }]} />
      <Text style={[styles.text, { color: tone }]}>{stale ? 'stale' : status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 88,
    height: 30,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 10
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize'
  }
});
