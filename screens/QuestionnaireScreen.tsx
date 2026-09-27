import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import {
  FitnessGoal,
  FitnessLevel,
  TimePreference,
  ExerciseType,
  GOAL_LABELS,
  LEVEL_LABELS,
  TIME_LABELS,
  TYPE_LABELS,
  FOCUS_AREAS,
} from '../lib/types';
import { colors, radius, spacing, shadows } from '../lib/theme';

const STEPS = ['Goals', 'Level', 'Time', 'Types', 'Focus'];

export default function QuestionnaireScreen() {
  const { completeQuestionnaire, user } = useApp();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [level, setLevel] = useState<FitnessLevel>('beginner');
  const [preferredTime, setPreferredTime] = useState<TimePreference>('30min');
  const [preferredTypes, setPreferredTypes] = useState<ExerciseType[]>([]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');
  const [generating, setGenerating] = useState(false);

  const toggleGoal = (g: FitnessGoal) => {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 3 ? [...prev, g] : prev
    );
  };

  const toggleType = (t: ExerciseType) => {
    setPreferredTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleFocus = (f: string) => {
    setFocusAreas((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : prev.length < 4 ? [...prev, f] : prev
    );
  };

  const canNext = () => {
    if (step === 0) return goals.length > 0 || customNote.trim().length > 0;
    if (step === 3) return preferredTypes.length > 0;
    if (step === 4) return focusAreas.length > 0 || customNote.trim().length > 0;
    return true;
  };

  const next = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setGenerating(true);
      // Simulate AI thinking
      await new Promise((r) => setTimeout(r, 1800));
      await completeQuestionnaire({
        goals,
        level,
        preferredTime,
        preferredTypes,
        focusAreas,
        customNote: customNote.trim(),
      });
      setGenerating(false);
    }
  };

  const somethingElseBox = (placeholder: string) => (
    <View style={styles.somethingElse}>
      <Text style={styles.somethingElseLabel}>Something else?</Text>
      <Text style={styles.somethingElseHint}>
        Tell the AI any extra goal — e.g. “increase height”, “fix knee pain”, “morning energy”
      </Text>
      <TextInput
        style={styles.somethingElseInput}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={customNote}
        onChangeText={setCustomNote}
        multiline
        maxLength={120}
        returnKeyType="done"
      />
    </View>
  );

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  if (generating) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.generating}>
          <Text style={{ fontSize: 64, marginBottom: 24 }}>🤖</Text>
          <Text style={styles.genTitle}>AI is crafting your plan...</Text>
          <Text style={styles.genSub}>
            {`Analyzing preferences for ${user?.name}${user?.partnerId ? ' & partner' : ''}...\nBuilding home-only exercises...\n${customNote ? `Factoring in: “${customNote}”...\n` : ''}Optimizing for ${preferredTime}...`}
          </Text>
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
          <View style={styles.genDots}>
            {['Goals', 'Level', 'Duration', 'Exercises', 'Motivation'].map((l, i) => (
              <View key={l} style={styles.genRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.genRowText}>{l} locked in</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={styles.header}>
        {step > 0 ? (
          <TouchableOpacity onPress={back} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.stepLabel}>
          {step + 1} / {STEPS.length}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((step + 1) / STEPS.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <>
            <Text style={styles.qTitle}>What do you want to improve?</Text>
            <Text style={styles.qSub}>Pick up to 3 goals — all plans are home workouts</Text>
            <View style={styles.grid}>
              {(Object.keys(GOAL_LABELS) as FitnessGoal[]).map((g) => {
                const selected = goals.includes(g);
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleGoal(g)}
                  >
                    <Text style={styles.chipEmoji}>{GOAL_LABELS[g].emoji}</Text>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {GOAL_LABELS[g].label}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {somethingElseBox('e.g. increase my height, sleep better…')}
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.qTitle}>What's your fitness level?</Text>
            <Text style={styles.qSub}>Be honest — AI will match the intensity</Text>
            {(Object.keys(LEVEL_LABELS) as FitnessLevel[]).map((l) => {
              const selected = level === l;
              const desc =
                l === 'beginner'
                  ? 'New to working out or getting back into it'
                  : l === 'intermediate'
                  ? 'Work out a few times a week consistently'
                  : 'Train hard regularly and know your stuff';
              return (
                <TouchableOpacity
                  key={l}
                  style={[styles.levelCard, selected && styles.levelSelected]}
                  onPress={() => setLevel(l)}
                >
                  <View style={styles.levelLeft}>
                    <Text style={[styles.levelTitle, selected && { color: colors.primary }]}>
                      {LEVEL_LABELS[l]}
                    </Text>
                    <Text style={styles.levelDesc}>{desc}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.qTitle}>How much time per day?</Text>
            <Text style={styles.qSub}>We'll build a routine that fits your schedule</Text>
            <View style={styles.timeGrid}>
              {(Object.keys(TIME_LABELS) as TimePreference[]).map((t) => {
                const selected = preferredTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timeCard, selected && styles.timeSelected]}
                    onPress={() => setPreferredTime(t)}
                  >
                    <Ionicons
                      name="time-outline"
                      size={28}
                      color={selected ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.timeText, selected && { color: colors.primary }]}>
                      {TIME_LABELS[t]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.qTitle}>Favorite exercise styles?</Text>
            <Text style={styles.qSub}>Select all that excite you</Text>
            <View style={styles.grid}>
              {(Object.keys(TYPE_LABELS) as ExerciseType[]).map((t) => {
                const selected = preferredTypes.includes(t);
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleType(t)}
                  >
                    <Text style={styles.chipEmoji}>{TYPE_LABELS[t].emoji}</Text>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {TYPE_LABELS[t].label}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.qTitle}>Focus areas?</Text>
            <Text style={styles.qSub}>
              Pick up to 4 — or describe something else below (AI builds a home plan for it)
            </Text>
            <View style={styles.grid}>
              {FOCUS_AREAS.map((f) => {
                const selected = focusAreas.includes(f);
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleFocus(f)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{f}</Text>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {somethingElseBox('e.g. increase height, better posture, flexibility…')}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !canNext() && styles.ctaDisabled]}
          onPress={next}
          disabled={!canNext()}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {step === STEPS.length - 1 ? 'Generate My Plan ✨' : 'Continue'}
          </Text>
          {step < STEPS.length - 1 && (
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { color: colors.textSecondary, fontWeight: '700', fontSize: 14 },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: { padding: spacing.lg, paddingBottom: 40 },
  qTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  qSub: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  grid: { gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 10,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '18',
  },
  chipEmoji: { fontSize: 22 },
  chipText: { color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 },
  chipTextSelected: { color: colors.primary },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 12,
  },
  levelSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '18',
  },
  levelLeft: { flex: 1 },
  levelTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  levelDesc: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 10,
  },
  timeSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '18',
  },
  timeText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.button,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  generating: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  genTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  genSub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  genDots: { marginTop: 40, gap: 10, alignSelf: 'stretch' },
  genRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  genRowText: { color: colors.textSecondary, fontSize: 14 },
  somethingElse: {
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.secondary + '66',
    borderStyle: 'dashed',
    padding: 16,
  },
  somethingElseLabel: {
    color: colors.secondaryLight,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  somethingElseHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  somethingElseInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.text,
    fontSize: 15,
    minHeight: 72,
    textAlignVertical: 'top',
  },
});
