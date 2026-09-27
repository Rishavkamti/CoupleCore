import React, { useEffect, useRef } from 'react';
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
import ProgressRing from '../components/ProgressRing';
import StatCard from '../components/StatCard';
import WeekChart from '../components/WeekChart';
import { getWeekActivity } from '../lib/streaks';
import { colors, radius, spacing, shadows } from '../lib/theme';

export default function PartnerScreen() {
  const {
    user,
    partner,
    couple,
    todayUserProgress,
    todayPartnerProgress,
    userStreak,
    partnerStreak,
    todayRoutine,
    partnerProgress,
    userProgress,
    createCouple,
    joinCouple,
    simulatePartnerProgress,
  } = useApp();

  const [joinCode, setJoinCode] = React.useState('');
  const [showJoin, setShowJoin] = React.useState(false);
  const [createdCode, setCreatedCode] = React.useState(user?.coupleCode || '');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-simulate partner activity every 20s for real-time feel
  useEffect(() => {
    if (!partner) return;
    intervalRef.current = setInterval(() => {
      simulatePartnerProgress();
    }, 20000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [partner, simulatePartnerProgress]);

  const handleCreate = async () => {
    const code = await createCouple();
    setCreatedCode(code);
  };

  const handleJoin = async () => {
    const result = await joinCouple(joinCode);
    if (!result.ok) {
      Alert.alert('Oops', result.error || 'Could not join');
    } else {
      setShowJoin(false);
    }
  };

  if (!partner) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.emptyWrap}>
          <Text style={{ fontSize: 64 }}>💕</Text>
          <Text style={styles.emptyTitle}>Connect with Your Partner</Text>
          <Text style={styles.emptySub}>
            Share workouts, track each other's progress in real time, and stay accountable together.
          </Text>

          {createdCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Your code</Text>
              <Text style={styles.codeText}>{createdCode}</Text>
              <Text style={styles.codeHint}>Share this with your partner</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.cta} onPress={handleCreate}>
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text style={styles.ctaText}>Create Couple Code</Text>
            </TouchableOpacity>
          )}

          {!showJoin ? (
            <TouchableOpacity style={styles.secondary} onPress={() => setShowJoin(true)}>
              <Text style={styles.secondaryText}>I have a code</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.joinBox}>
              <TextInput
                style={styles.input}
                placeholder="Enter code"
                placeholderTextColor={colors.textMuted}
                value={joinCode}
                onChangeText={(t) =>
                  setJoinCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
                }
                maxLength={6}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.cta, joinCode.length < 6 && { opacity: 0.4 }]}
                onPress={handleJoin}
                disabled={joinCode.length < 6}
              >
                <Text style={styles.ctaText}>Connect</Text>
              </TouchableOpacity>
              <Text style={styles.demoHint}>Demo: try LOVE22 or any 6-char code</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const myPct = todayUserProgress?.percentage || 0;
  const theirPct = todayPartnerProgress?.percentage || 0;
  const myWeek = getWeekActivity(userProgress);
  const theirWeek = getWeekActivity(partnerProgress);

  const exerciseRows =
    todayRoutine?.exercises.map((ex) => {
      const mine =
        todayUserProgress?.exercises.find((e) => e.exerciseId === ex.id)?.completed || false;
      const theirs =
        todayPartnerProgress?.exercises.find((e) => e.exerciseId === ex.id)?.completed || false;
      return { ex, mine, theirs };
    }) || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Couple Hub</Text>
        <Text style={styles.subtitle}>Real-time progress · Code {couple?.code || user?.coupleCode}</Text>

        {/* Dual progress */}
        <View style={styles.dualCard}>
          <View style={styles.dualSide}>
            <Text style={styles.dualAvatar}>{user?.avatar}</Text>
            <Text style={styles.dualName}>{user?.name}</Text>
            <ProgressRing percentage={myPct} size={90} stroke={7} color={colors.primary} />
            <Text style={styles.dualStreak}>🔥 {userStreak?.currentStreak ?? 0} streak</Text>
          </View>

          <View style={styles.vsCol}>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.heartLine}>
              <Ionicons name="heart" size={20} color={colors.primary} />
            </View>
            <TouchableOpacity onPress={simulatePartnerProgress} style={styles.syncMini}>
              <Ionicons name="sync" size={16} color={colors.partner2} />
            </TouchableOpacity>
          </View>

          <View style={styles.dualSide}>
            <Text style={styles.dualAvatar}>{partner.avatar}</Text>
            <Text style={styles.dualName}>{partner.name}</Text>
            <ProgressRing percentage={theirPct} size={90} stroke={7} color={colors.partner2} />
            <Text style={styles.dualStreak}>🔥 {partnerStreak?.currentStreak ?? 0} streak</Text>
          </View>
        </View>

        {/* Couple stats */}
        <View style={styles.statsRow}>
          <StatCard
            emoji="💑"
            value={couple?.totalCoupleWorkouts ?? 0}
            label="Couple WOs"
            accent={colors.primary}
          />
          <StatCard
            emoji="⚡"
            value={`${Math.round((myPct + theirPct) / 2)}%`}
            label="Team Today"
            accent={colors.accent}
          />
          <StatCard
            emoji="🏅"
            value={Math.max(userStreak?.longestStreak ?? 0, partnerStreak?.longestStreak ?? 0)}
            label="Best Ever"
            accent={colors.secondaryLight}
          />
        </View>

        {/* Live exercise checklist */}
        <Text style={styles.sectionTitle}>Live Exercise Tracker</Text>
        <View style={styles.trackerCard}>
          <View style={styles.trackerHead}>
            <Text style={[styles.trackerCol, { flex: 2 }]}>Exercise</Text>
            <Text style={[styles.trackerCol, { color: colors.primary }]}>You</Text>
            <Text style={[styles.trackerCol, { color: colors.partner2 }]}>{partner.name}</Text>
          </View>
          {exerciseRows.map(({ ex, mine, theirs }) => (
            <View key={ex.id} style={styles.trackerRow}>
              <Text style={[styles.trackerEx, { flex: 2 }]} numberOfLines={1}>
                {ex.emoji} {ex.name}
              </Text>
              <View style={styles.trackerCheck}>
                <Ionicons
                  name={mine ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={mine ? colors.success : colors.textMuted}
                />
              </View>
              <View style={styles.trackerCheck}>
                <Ionicons
                  name={theirs ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={theirs ? colors.partner2 : colors.textMuted}
                />
              </View>
            </View>
          ))}
          {exerciseRows.length === 0 && (
            <Text style={styles.noEx}>No routine loaded yet</Text>
          )}
        </View>

        {/* Weeks */}
        <Text style={styles.sectionTitle}>Your Week</Text>
        <WeekChart data={myWeek} color={colors.primary} />

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{partner.name}'s Week</Text>
        <WeekChart data={theirWeek} color={colors.partner2} />

        <View style={styles.encourage}>
          <Text style={styles.encourageEmoji}>💬</Text>
          <Text style={styles.encourageText}>
            {theirPct > myPct
              ? `${partner.name} is ahead — time to catch up!`
              : myPct > theirPct
              ? `You're leading! Send ${partner.name} some motivation.`
              : myPct === 100 && theirPct === 100
              ? 'Perfect sync today! You both finished 🎉'
              : 'Neck and neck — finish strong together!'}
          </Text>
        </View>

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
  dualCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  dualSide: { flex: 1, alignItems: 'center', gap: 6 },
  dualAvatar: { fontSize: 32 },
  dualName: { color: colors.text, fontWeight: '700', fontSize: 14 },
  dualStreak: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  vsCol: { alignItems: 'center', paddingHorizontal: 8, gap: 8 },
  vs: { color: colors.textMuted, fontWeight: '900', fontSize: 14 },
  heartLine: {},
  syncMini: {
    padding: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.lg },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  trackerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  trackerHead: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trackerCol: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  trackerEx: { color: colors.text, fontSize: 13, fontWeight: '600' },
  trackerCheck: { flex: 1, alignItems: 'center' },
  noEx: { color: colors.textMuted, textAlign: 'center', padding: 16 },
  encourage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.secondary + '22',
    borderRadius: radius.lg,
    padding: 16,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary + '44',
  },
  encourageEmoji: { fontSize: 28 },
  encourageText: { color: colors.text, flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  emptyWrap: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySub: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    marginBottom: 32,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...shadows.button,
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondary: { marginTop: 20, padding: 12 },
  secondaryText: { color: colors.partner2, fontWeight: '700', fontSize: 15 },
  codeBox: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    padding: 28,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  codeLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  codeText: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
    marginVertical: 8,
  },
  codeHint: { color: colors.textSecondary, fontSize: 13 },
  joinBox: { width: '100%', marginTop: 8, gap: 12, alignItems: 'center' },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 6,
    width: '100%',
  },
  demoHint: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic' },
});
