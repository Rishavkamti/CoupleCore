import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../lib/AppContext';
import ProgressRing from '../components/ProgressRing';
import StatCard from '../components/StatCard';
import PunishmentBanner from '../components/PunishmentBanner';
import WeekChart from '../components/WeekChart';
import { getWeekActivity } from '../lib/streaks';
import { colors, radius, spacing, shadows } from '../lib/theme';
import { LEVEL_LABELS } from '../lib/types';

type RootStackParamList = {
  MainTabs: undefined;
  ExerciseDetail: { exerciseId: string };
  PunishmentDetail: { punishmentId: string };
  WorkoutSession: undefined;
};

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    user,
    partner,
    todayRoutine,
    todayUserProgress,
    todayPartnerProgress,
    userStreak,
    activePunishments,
    completePunishment,
    regenerateRoutine,
    simulatePartnerProgress,
    refreshMissCheck,
  } = useApp();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshMissCheck();
    if (partner) await simulatePartnerProgress();
    setRefreshing(false);
  }, [refreshMissCheck, simulatePartnerProgress, partner]);

  const { userProgress } = useApp();
  const pct = todayUserProgress?.percentage || 0;
  const partnerPct = todayPartnerProgress?.percentage || 0;
  const week = getWeekActivity(userProgress);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const myPunishment = activePunishments.find((p) => p.assignedTo === user?.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>
              {user?.avatar} {user?.name}
            </Text>
          </View>
          {partner ? (
            <View style={styles.partnerChip}>
              <Text style={styles.partnerAvatar}>{partner.avatar}</Text>
              <Text style={styles.partnerName}>{partner.name}</Text>
              <View style={styles.liveDot} />
            </View>
          ) : (
            <View style={styles.soloChip}>
              <Ionicons name="person" size={14} color={colors.textSecondary} />
              <Text style={styles.soloText}>Solo</Text>
            </View>
          )}
        </View>

        {/* Punishment */}
        {myPunishment && (
          <PunishmentBanner
            punishment={myPunishment}
            onPress={() =>
              nav.navigate('PunishmentDetail', { punishmentId: myPunishment.id })
            }
            onComplete={() => completePunishment(myPunishment.id)}
          />
        )}

        {/* Today's Routine Hero */}
        {todayRoutine && (
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTag}>TODAY'S ROUTINE</Text>
                <Text style={styles.heroTitle}>{todayRoutine.title}</Text>
                <Text style={styles.heroDesc} numberOfLines={2}>
                  {todayRoutine.description}
                </Text>
              </View>
              <ProgressRing
                percentage={pct}
                size={88}
                stroke={7}
                color={pct === 100 ? colors.success : colors.primary}
                sublabel="done"
              />
            </View>

            <View style={styles.heroMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={colors.accent} />
                <Text style={styles.metaText}>{todayRoutine.totalDuration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="barbell-outline" size={16} color={colors.secondaryLight} />
                <Text style={styles.metaText}>{todayRoutine.exercises.length} exercises</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flash-outline" size={16} color={colors.primary} />
                <Text style={styles.metaText}>{LEVEL_LABELS[todayRoutine.difficulty]}</Text>
              </View>
            </View>

            <Text style={styles.quote}>"{todayRoutine.motivationalQuote}"</Text>

            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => nav.navigate('WorkoutSession')}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={pct === 100 ? 'checkmark-circle' : 'play'}
                  size={22}
                  color="#fff"
                />
                <Text style={styles.startText}>
                  {pct === 100 ? 'Completed!' : pct > 0 ? 'Continue Workout' : 'Start Workout'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.refreshBtn} onPress={regenerateRoutine}>
                <Ionicons name="sparkles" size={20} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Partner live progress */}
        {partner && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Partner Live</Text>
              <TouchableOpacity onPress={simulatePartnerProgress}>
                <Text style={styles.syncBtn}>↻ Sync</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.partnerLive}>
              <View style={styles.partnerLiveLeft}>
                <Text style={styles.bigAvatar}>{partner.avatar}</Text>
                <View>
                  <Text style={styles.pName}>{partner.name}</Text>
                  <Text style={styles.pStatus}>
                    {partnerPct === 100
                      ? 'Finished today! 🎉'
                      : partnerPct > 0
                      ? `Working out · ${partnerPct}%`
                      : 'Not started yet'}
                  </Text>
                </View>
              </View>
              <ProgressRing
                percentage={partnerPct}
                size={64}
                stroke={6}
                color={colors.partner2}
              />
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            emoji="🔥"
            value={userStreak?.currentStreak ?? 0}
            label="Day Streak"
            accent={colors.streak}
          />
          <StatCard
            emoji="💪"
            value={userStreak?.totalWorkouts ?? 0}
            label="Workouts"
            accent={colors.primary}
          />
          <StatCard
            emoji="🏆"
            value={userStreak?.longestStreak ?? 0}
            label="Best Streak"
            accent={colors.accent}
          />
        </View>

        {/* Week activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <WeekChart data={week} color={colors.primary} />
        </View>

        {/* Miss warning */}
        {(userStreak?.consecutiveMisses ?? 0) > 0 && (
          <View style={styles.missWarn}>
            <Ionicons name="warning" size={22} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.missTitle}>
                {userStreak!.consecutiveMisses} missed day
                {userStreak!.consecutiveMisses > 1 ? 's' : ''} in a row
              </Text>
              <Text style={styles.missDesc}>
                {3 - userStreak!.consecutiveMisses > 0
                  ? `Miss ${3 - userStreak!.consecutiveMisses} more and a punishment drops!`
                  : 'Punishment incoming!'}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: { color: colors.textSecondary, fontSize: 14 },
  name: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 2 },
  partnerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.partner2 + '44',
  },
  partnerAvatar: { fontSize: 18 },
  partnerName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  soloChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  soloText: { color: colors.textSecondary, fontSize: 13 },
  hero: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '44',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  heroTop: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  heroTag: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  heroDesc: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  heroMeta: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  quote: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 18,
  },
  heroActions: { flexDirection: 'row', gap: 10 },
  startBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  refreshBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: { marginBottom: spacing.lg },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  syncBtn: { color: colors.partner2, fontWeight: '700', fontSize: 13, marginBottom: 12 },
  partnerLive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.partner2 + '33',
  },
  partnerLiveLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  bigAvatar: { fontSize: 36 },
  pName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  pStatus: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.lg },
  missWarn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.warning + '18',
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.warning + '44',
    marginBottom: spacing.md,
  },
  missTitle: { color: colors.warning, fontWeight: '700', fontSize: 14 },
  missDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});
