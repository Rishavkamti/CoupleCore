import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import {
  GOAL_LABELS,
  LEVEL_LABELS,
  TIME_LABELS,
  TYPE_LABELS,
  FitnessGoal,
  ExerciseType,
} from '../lib/types';
import { colors, radius, spacing, shadows } from '../lib/theme';
export default function ProfileScreen() {
  const {
    user,
    partner,
    couple,
    userStreak,
    resetApp,
    updateUserName,
    regenerateRoutine,
    applyDemoPunishment,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const saveName = async () => {
    if (name.trim()) {
      await updateUserName(name.trim());
      setEditing(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset App?',
      'This clears all data including couple connection, progress, and streaks.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetApp(),
        },
      ]
    );
  };

  const triggerDemoPunishment = () => {
    Alert.alert(
      'Demo Punishment',
      'Simulate missing 3 days and apply a fun punishment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            await applyDemoPunishment();
            Alert.alert('Uh oh!', 'Punishment applied — check Home or Progress.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <Text style={styles.avatar}>{user?.avatar}</Text>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={24}
              />
              <TouchableOpacity onPress={saveName} style={styles.saveBtn}>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.nameRow}
              onPress={() => {
                setName(user?.name || '');
                setEditing(true);
              }}
            >
              <Text style={styles.name}>{user?.name}</Text>
              <Ionicons name="pencil" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          <Text style={styles.memberSince}>
            Member since {user?.createdAt?.slice(0, 10) || '—'}
          </Text>
        </View>

        {/* Couple info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Couple Connection</Text>
          {partner ? (
            <View style={styles.coupleRow}>
              <Text style={styles.coupleAvatar}>{user?.avatar}</Text>
              <Ionicons name="heart" size={20} color={colors.primary} />
              <Text style={styles.coupleAvatar}>{partner.avatar}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.coupleNames}>
                  {user?.name} & {partner.name}
                </Text>
                <Text style={styles.coupleCode}>Code: {couple?.code || user?.coupleCode}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.muted}>
              Not connected yet. Visit the Partner tab to link up!
            </Text>
          )}
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fitness Preferences</Text>

          <Text style={styles.prefLabel}>Goals</Text>
          <View style={styles.tags}>
            {(user?.goals || []).map((g) => (
              <View key={g} style={styles.tag}>
                <Text style={styles.tagText}>
                  {GOAL_LABELS[g as FitnessGoal]?.emoji}{' '}
                  {GOAL_LABELS[g as FitnessGoal]?.label || g}
                </Text>
              </View>
            ))}
            {(user?.goals || []).length === 0 && (
              <Text style={styles.muted}>None set</Text>
            )}
          </View>

          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Level</Text>
            <Text style={styles.prefVal}>
              {user?.level ? LEVEL_LABELS[user.level] : '—'}
            </Text>
          </View>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Daily Time</Text>
            <Text style={styles.prefVal}>
              {user?.preferredTime ? TIME_LABELS[user.preferredTime] : '—'}
            </Text>
          </View>

          <Text style={[styles.prefLabel, { marginTop: 12 }]}>Exercise Types</Text>
          <View style={styles.tags}>
            {(user?.preferredTypes || []).map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>
                  {TYPE_LABELS[t as ExerciseType]?.emoji}{' '}
                  {TYPE_LABELS[t as ExerciseType]?.label || t}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.prefLabel, { marginTop: 12 }]}>Focus Areas</Text>
          <View style={styles.tags}>
            {(user?.focusAreas || []).map((f) => (
              <View key={f} style={styles.tag}>
                <Text style={styles.tagText}>{f}</Text>
              </View>
            ))}
          </View>

          {!!user?.customNote && (
            <>
              <Text style={[styles.prefLabel, { marginTop: 12 }]}>Something else</Text>
              <Text style={styles.muted}>{user.customNote}</Text>
            </>
          )}

          <Text style={[styles.prefLabel, { marginTop: 12 }]}>Workout style</Text>
          <Text style={styles.muted}>Home-only · no gym equipment required</Text>
        </View>

        {/* Stats summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Stats</Text>
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{userStreak?.currentStreak ?? 0}</Text>
              <Text style={styles.statLbl}>Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{userStreak?.longestStreak ?? 0}</Text>
              <Text style={styles.statLbl}>Best</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{userStreak?.totalWorkouts ?? 0}</Text>
              <Text style={styles.statLbl}>Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{userStreak?.consecutiveMisses ?? 0}</Text>
              <Text style={styles.statLbl}>Misses</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.actionBtn} onPress={regenerateRoutine}>
          <Ionicons name="sparkles" size={20} color={colors.accent} />
          <Text style={styles.actionText}>Regenerate Today's Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={triggerDemoPunishment}>
          <Ionicons name="flash" size={20} color={colors.punish} />
          <Text style={[styles.actionText, { color: colors.punish }]}>
            Demo: Trigger Punishment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleReset}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Reset All Data</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CoupleCore · Couples Home Workout</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.lg },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  avatar: { fontSize: 64, marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: colors.text, fontSize: 24, fontWeight: '800' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    minWidth: 160,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: colors.success,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberSince: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  coupleRow: { flexDirection: 'row', alignItems: 'center' },
  coupleAvatar: { fontSize: 28 },
  coupleNames: { color: colors.text, fontWeight: '700', fontSize: 15 },
  coupleCode: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  muted: { color: colors.textMuted, fontSize: 14 },
  prefLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  prefVal: { color: colors.text, fontWeight: '700', fontSize: 15 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  tag: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  tagText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', alignItems: 'center', paddingVertical: 12 },
  statNum: { color: colors.primary, fontSize: 28, fontWeight: '900' },
  statLbl: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  version: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
});
