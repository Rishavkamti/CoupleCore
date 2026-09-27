import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../lib/theme';

interface Props {
  percentage: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  percentage,
  size = 100,
  stroke = 8,
  color = colors.primary,
  label,
  sublabel,
}: Props) {
  const pct = Math.min(100, Math.max(0, percentage));
  const radius = (size - stroke) / 2;
  const segments = 24;
  const filled = Math.round((pct / 100) * segments);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}>
        {Array.from({ length: segments }).map((_, i) => {
          const angle = (i / segments) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const isFilled = i < filled;
          const dotSize = stroke;
          const cx = size / 2 + radius * Math.cos(rad) - dotSize / 2;
          const cy = size / 2 + radius * Math.sin(rad) - dotSize / 2;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: cx,
                top: cy,
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: isFilled ? color : colors.surfaceLight,
                opacity: isFilled ? 1 : 0.4,
              }}
            />
          );
        })}
      </View>
      <View style={styles.center}>
        <Text style={[styles.label, { color }]}>
          {label ?? `${pct}%`}
        </Text>
        {sublabel ? <Text style={styles.sub}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 22,
    fontWeight: '800',
  },
  sub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
