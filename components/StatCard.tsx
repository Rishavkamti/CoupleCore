import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../lib/theme';

interface Props {
  emoji: string;
  value: string | number;
  label: string;
  accent?: string;
}

export default function StatCard({ emoji, value, label, accent = colors.primary }: Props) {
  return (
    <View style={[styles.card, { borderColor: accent + '33' }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    minWidth: 90,
  },
  emoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});
