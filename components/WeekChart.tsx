import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../lib/theme';

interface Day {
  date: string;
  day: string;
  completed: boolean;
  percentage: number;
}

interface Props {
  data: Day[];
  color?: string;
}

export default function WeekChart({ data, color = colors.primary }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <View style={styles.wrap}>
      {data.map((d) => {
        const h = Math.max(8, (d.percentage / 100) * 64);
        const isToday = d.date === today;
        return (
          <View key={d.date} style={styles.col}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor: d.completed
                      ? color
                      : d.percentage > 0
                      ? color + '88'
                      : colors.surfaceLight,
                  },
                ]}
              />
            </View>
            <Text style={[styles.day, isToday && { color, fontWeight: '800' }]}>
              {d.day}
            </Text>
            {d.completed && <Text style={styles.check}>✓</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  col: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 64,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 18,
    borderRadius: 6,
    minHeight: 6,
  },
  day: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  check: {
    color: colors.success,
    fontSize: 10,
    marginTop: 2,
  },
});
