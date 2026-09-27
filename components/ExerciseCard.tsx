import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Exercise } from '../lib/types';
import { colors, radius, shadows } from '../lib/theme';

interface Props {
  exercise: Exercise;
  index: number;
  completed: boolean;
  partnerCompleted?: boolean;
  onToggle: () => void;
  onPress: () => void;
}

export default function ExerciseCard({
  exercise,
  index,
  completed,
  partnerCompleted,
  onToggle,
  onPress,
}: Props) {
  const durationMin = Math.ceil(exercise.duration / 60);

  return (
    <TouchableOpacity
      style={[styles.card, completed && styles.cardDone]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <TouchableOpacity
        style={[styles.check, completed && styles.checkDone]}
        onPress={onToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {completed ? (
          <Ionicons name="checkmark" size={18} color="#fff" />
        ) : (
          <Text style={styles.index}>{index + 1}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{exercise.emoji}</Text>
          <Text style={[styles.name, completed && styles.nameDone]} numberOfLines={1}>
            {exercise.name}
          </Text>
          {exercise.isPartner && (
            <View style={styles.partnerBadge}>
              <Ionicons name="heart" size={10} color={colors.primary} />
              <Text style={styles.partnerText}>Duo</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {exercise.sets && exercise.reps
            ? `${exercise.sets}×${exercise.reps} · ~${durationMin} min`
            : exercise.reps
            ? `${exercise.reps} reps · ~${durationMin} min`
            : `${exercise.duration}s · ~${durationMin} min`}
          {' · '}
          {exercise.type}
        </Text>
      </View>

      {partnerCompleted !== undefined && (
        <View style={styles.partnerStatus}>
          <Ionicons
            name={partnerCompleted ? 'checkmark-circle' : 'ellipse-outline'}
            size={18}
            color={partnerCompleted ? colors.partner2 : colors.textMuted}
          />
        </View>
      )}

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  cardDone: {
    borderColor: colors.success + '55',
    backgroundColor: colors.success + '12',
  },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  checkDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  index: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 16,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  nameDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    gap: 3,
  },
  partnerText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  partnerStatus: {
    marginRight: 4,
  },
});
