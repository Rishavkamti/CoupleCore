import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../lib/AppContext';
import ExerciseCard from '../components/ExerciseCard';
import ProgressRing from '../components/ProgressRing';
import { Exercise } from '../lib/types';
import { colors, radius, spacing, shadows } from '../lib/theme';

type RootStackParamList = {
  MainTabs: undefined;
  ExerciseDetail: { exerciseId: string };
  WorkoutSession: undefined;
};

export default function WorkoutScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    todayRoutine,
    todayUserProgress,
    todayPartnerProgress,
    partner,
    toggleExercise,
    regenerateRoutine,
  } = useApp();

  const [selected, setSelected] = useState<Exercise | null>(null);

  if (!todayRoutine) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>📋</Text>
          <Text style={styles.emptyTitle}>No routine yet</Text>
          <Text style={styles.emptySub}>Complete the questionnaire to get your AI plan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pct = todayUserProgress?.percentage || 0;
  const isDone = (id: string) =>
    todayUserProgress?.exercises.find((e) => e.exerciseId === id)?.completed || false;
  const partnerDone = (id: string) =>
    partner
      ? todayPartnerProgress?.exercises.find((e) => e.exerciseId === id)?.completed || false
      : undefined;

  const doneCount = todayUserProgress?.exercises.filter((e) => e.completed).length || 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Today's Plan</Text>
          <Text style={styles.subtitle}>{todayRoutine.title}</Text>
        </View>
        <ProgressRing percentage={pct} size={56} stroke={5} />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {doneCount}/{todayRoutine.exercises.length} complete · {todayRoutine.totalDuration} min
        </Text>
        <TouchableOpacity onPress={regenerateRoutine} style={styles.regen}>
          <Ionicons name="sparkles" size={16} color={colors.accent} />
          <Text style={styles.regenText}>New plan</Text>
        </TouchableOpacity>
      </View>

      {partner && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.legendText}>You</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="checkmark-circle" size={14} color={colors.partner2} />
            <Text style={styles.legendText}>{partner.name}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={todayRoutine.exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <ExerciseCard
            exercise={item}
            index={index}
            completed={isDone(item.id)}
            partnerCompleted={partnerDone(item.id)}
            onToggle={() => toggleExercise(item.id)}
            onPress={() => setSelected(item)}
          />
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.startAll, pct === 100 && styles.startAllDone]}
            onPress={() => nav.navigate('WorkoutSession')}
            activeOpacity={0.85}
          >
            <Ionicons
              name={pct === 100 ? 'trophy' : 'fitness'}
              size={22}
              color="#fff"
            />
            <Text style={styles.startAllText}>
              {pct === 100 ? 'All Done — Great Job!' : 'Start Guided Session'}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Exercise detail modal */}
      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selected && (
              <>
                <View style={styles.modalHandle} />
                <Text style={styles.modalEmoji}>{selected.emoji}</Text>
                <Text style={styles.modalTitle}>{selected.name}</Text>
                <Text style={styles.modalDesc}>{selected.description}</Text>

                <View style={styles.modalMeta}>
                  {selected.isPartner && (
                    <View style={styles.badge}>
                      <Ionicons name="heart" size={12} color={colors.primary} />
                      <Text style={styles.badgeText}>Partner Move</Text>
                    </View>
                  )}
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{selected.duration}s</Text>
                  </View>
                  {selected.sets && selected.reps && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {selected.sets}×{selected.reps}
                      </Text>
                    </View>
                  )}
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{selected.type}</Text>
                  </View>
                </View>

                <Text style={styles.instructTitle}>How to do it</Text>
                {selected.instructions.map((ins, i) => (
                  <View key={i} style={styles.instructRow}>
                    <View style={styles.instructNum}>
                      <Text style={styles.instructNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.instructText}>{ins}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={[
                    styles.modalCta,
                    isDone(selected.id) && { backgroundColor: colors.success },
                  ]}
                  onPress={() => {
                    toggleExercise(selected.id);
                    setSelected(null);
                  }}
                >
                  <Ionicons
                    name={isDone(selected.id) ? 'close-circle' : 'checkmark-circle'}
                    size={22}
                    color="#fff"
                  />
                  <Text style={styles.modalCtaText}>
                    {isDone(selected.id) ? 'Mark Incomplete' : 'Mark Complete'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: 12,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: 12,
    marginBottom: 8,
  },
  summaryText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  regen: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regenText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  legend: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: spacing.md,
    marginBottom: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { color: colors.textMuted, fontSize: 12 },
  list: { padding: spacing.md, paddingBottom: 40 },
  startAll: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    ...shadows.button,
  },
  startAllDone: { backgroundColor: colors.success },
  startAllText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySub: { color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalEmoji: { fontSize: 48, textAlign: 'center' },
  modalTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  modalDesc: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  modalMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  badgeText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  instructTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  instructRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  instructNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructNumText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  instructText: { color: colors.textSecondary, fontSize: 14, flex: 1, lineHeight: 20, paddingTop: 4 },
  modalCta: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  modalCtaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalClose: { alignItems: 'center', padding: 16 },
  modalCloseText: { color: colors.textSecondary, fontWeight: '600' },
});
