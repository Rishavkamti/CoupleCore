import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../lib/AppContext';
import StatCard from '../components/StatCard';
import WeekChart from '../components/WeekChart';
import ProgressRing from '../components/ProgressRing';
import { getWeekActivity } from '../lib/streaks';
import { colors, radius, spacing } from '../lib/theme';

type RootStackParamList = {
  PunishmentDetail: { punishmentId: string };
};

export default function ProgressScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    user,
    partner,
    userStreak,
    partnerStreak,
    userProgress,
    partnerProgress,
    punishments,
    activePunishments,
    completePunishment,
    todayUserProgress,
  } = useApp();

  const week = getWeekActivity(userProgress);
  const completedDays = userProgress.filter((p) => p.completed).length;
  const avgPct =
    userProgress.length > 0
      ? Math.round(
          userProgress.reduce((s, p) => s + p.percentage, 0) / userProgress.length
        )
      : 0;

  const history = useMemo(
    () =>
      [...userProgress]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14),
    [userProgress]
  );

  const myPunishments = punishments.filter((p) => p.assignedTo === user?.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Track streaks, history & accountability</Text>

        {/* Big streak */}
        <View style={styles.streakHero}>
          <View style={styles.streakLeft}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNum}>{userStreak?.currentStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakRight}>
            <View style={styles.miniStat}>
              <Text style={styles.miniVal}>{userStreak?.longestStreak ?? 0}</Text>
              <Text style={styles.miniLabel}>Best</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={styles.miniVal}>{userStreak?.totalWorkouts ?? 0}</Text>
              <Text style={styles.miniLabel}>Total</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={styles.miniVal}>{completedDays}</Text>
              <Text style={styles.miniLabel}>Full Days</Text>
            </View>
          </View>
        </View>

        {/* Miss counter */}
        <View
          style={[
            styles.missCard,
            (userStreak?.consecutiveMisses ?? 0) >= 2 && styles.missDanger,
          ]}
        >
          <Ionicons
            name="shield-half"
            size={28}
            color={
              (userStreak?.consecutiveMisses ?? 0) >= 2 ? colors.punish : colors.warning
            }
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.missTitle}>Accountability Meter</Text>
            <Text style={styles.missDesc}>
              Consecutive misses: {userStreak?.consecutiveMisses ?? 0}/3
              {(userStreak?.consecutiveMisses ?? 0) >= 3
                ? ' — Punishment applied!'
                : (userStreak?.consecutiveMisses ?? 0) === 0
                ? " — You're safe! Keep it up."
                : ` — ${3 - (userStreak?.consecutiveMisses ?? 0)} more until punishment`}
            </Text>
            <View style={styles.missBars}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.missBar,
                    i < (userStreak?.consecutiveMisses ?? 0) && styles.missBarFilled,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard emoji="📊" value={`${avgPct}%`} label="Avg Complete" accent={colors.secondaryLight} />
          <StatCard
            emoji="✅"
            value={`${todayUserProgress?.percentage ?? 0}%`}
            label="Today"
            accent={colors.success}
          />
          <StatCard
            emoji="⚡"
            value={activePunishments.filter((p) => p.assignedTo === user?.id).length}
            label="Active Punish"
            accent={colors.punish}
          />
        </View>

        <Text style={styles.sectionTitle}>This Week</Text>
        <WeekChart data={week} />

        {/* Partner comparison */}
        {partner && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Couple Comparison</Text>
            <View style={styles.compareCard}>
              <View style={styles.compareSide}>
                <Text style={styles.compareAvatar}>{user?.avatar}</Text>
                <Text style={styles.compareName}>{user?.name}</Text>
                <ProgressRing
                  percentage={Math.min(100, (userStreak?.totalWorkouts ?? 0) * 10)}
                  size={70}
                  stroke={6}
                  color={colors.primary}
                  label={String(userStreak?.totalWorkouts ?? 0)}
                  sublabel="WOs"
                />
                <Text style={styles.compareStreak}>🔥 {userStreak?.currentStreak ?? 0}</Text>
              </View>
              <Text style={styles.compareVs}>VS</Text>
              <View style={styles.compareSide}>
                <Text style={styles.compareAvatar}>{partner.avatar}</Text>
                <Text style={styles.compareName}>{partner.name}</Text>
                <ProgressRing
                  percentage={Math.min(100, (partnerStreak?.totalWorkouts ?? 0) * 10)}
                  size={70}
                  stroke={6}
                  color={colors.partner2}
                  label={String(partnerStreak?.totalWorkouts ?? 0)}
                  sublabel="WOs"
                />
                <Text style={styles.compareStreak}>🔥 {partnerStreak?.currentStreak ?? 0}</Text>
              </View>
            </View>
          </>
        )}

        {/* Punishments */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Punishments</Text>
        {myPunishments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 32 }}>😇</Text>
            <Text style={styles.emptyText}>No punishments — stay consistent!</Text>
          </View>
        ) : (
          myPunishments.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.punishCard, p.completed && styles.punishDone]}
              onPress={() => nav.navigate('PunishmentDetail', { punishmentId: p.id })}
            >
              <Text style={styles.punishEmoji}>{p.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.punishTitle}>{p.title}</Text>
                <Text style={styles.punishMeta}>
                  {p.completed
                    ? `Completed ${p.completedAt?.slice(0, 10) || ''}`
                    : `Due ${p.dueDate}`}
                </Text>
              </View>
              {p.completed ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              ) : (
                <TouchableOpacity
                  style={styles.punishBtn}
                  onPress={() => completePunishment(p.id)}
                >
                  <Text style={styles.punishBtnText}>Done</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
        )}

        {/* History */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent History</Text>
        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Complete your first workout to see history</Text>
          </View>
        ) : (
          history.map((h) => (
            <View key={h.date} style={styles.histRow}>
              <View
                style={[
                  styles.histDot,
                  {
                    backgroundColor: h.completed
                      ? colors.success
                      : h.percentage > 0
                      ? colors.warning
                      : colors.surfaceLight,
                  },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.histDate}>{h.date}</Text>
                <Text style={styles.histMeta}>
                  {h.exercises.filter((e) => e.completed).length}/{h.exercises.length} exercises
                </Text>
              </View>
              <Text
                style={[
                  styles.histPct,
                  { color: h.completed ? colors.success : colors.textSecondary },
                ]}
              >
                {h.percentage}%
              </Text>
            </View>
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.lg, marginTop: 4 },
  streakHero: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.streak + '44',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  streakLeft: { alignItems: 'center', paddingRight: 20 },
  streakEmoji: { fontSize: 28 },
  streakNum: { color: colors.streak, fontSize: 48, fontWeight: '900' },
  streakLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  streakDivider: {
    width: 1,
    height: 80,
    backgroundColor: colors.border,
    marginRight: 20,
  },
  streakRight: { flex: 1, gap: 12 },
  miniStat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniVal: { color: colors.text, fontSize: 20, fontWeight: '800' },
  miniLabel: { color: colors.textMuted, fontSize: 13 },
  missCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: colors.warning + '15',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.warning + '44',
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  missDanger: {
    backgroundColor: colors.punish + '18',
    borderColor: colors.punish + '55',
  },
  missTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  missDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 18 },
  missBars: { flexDirection: 'row', gap: 6, marginTop: 10 },
  missBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceLight,
  },
  missBarFilled: { backgroundColor: colors.punish },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.lg },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  compareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compareSide: { flex: 1, alignItems: 'center', gap: 6 },
  compareAvatar: { fontSize: 28 },
  compareName: { color: colors.text, fontWeight: '700', fontSize: 13 },
  compareStreak: { color: colors.textMuted, fontSize: 12 },
  compareVs: { color: colors.textMuted, fontWeight: '900', paddingHorizontal: 8 },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  punishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.punish + '15',
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.punish + '44',
    gap: 12,
  },
  punishDone: {
    backgroundColor: colors.success + '12',
    borderColor: colors.success + '44',
  },
  punishEmoji: { fontSize: 28 },
  punishTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  punishMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  punishBtn: {
    backgroundColor: colors.punish,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  punishBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  histDot: { width: 12, height: 12, borderRadius: 6 },
  histDate: { color: colors.text, fontWeight: '600', fontSize: 14 },
  histMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  histPct: { fontWeight: '800', fontSize: 16 },
});
