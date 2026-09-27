import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useApp } from '../lib/AppContext';
import { colors, radius, spacing, shadows } from '../lib/theme';

type Params = { PunishmentDetail: { punishmentId: string } };

export default function PunishmentDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<RouteProp<Params, 'PunishmentDetail'>>();
  const { punishments, completePunishment, user, partner } = useApp();

  const punishment = punishments.find((p) => p.id === route.params.punishmentId);

  if (!punishment) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Punishment not found</Text>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isMine = punishment.assignedTo === user?.id;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Punishment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>{punishment.emoji}</Text>
          {!punishment.completed && (
            <View style={styles.liveTag}>
              <Text style={styles.liveTagText}>ACTIVE</Text>
            </View>
          )}
          {punishment.completed && (
            <View style={[styles.liveTag, { backgroundColor: colors.success + '33' }]}>
              <Text style={[styles.liveTagText, { color: colors.success }]}>COMPLETED</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{punishment.title}</Text>
        <Text style={styles.desc}>{punishment.description}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={18} color={colors.textMuted} />
            <Text style={styles.infoLabel}>Assigned to</Text>
            <Text style={styles.infoVal}>
              {isMine ? `You (${user?.name})` : partner?.name || 'Partner'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color={colors.textMuted} />
            <Text style={styles.infoLabel}>Due date</Text>
            <Text style={styles.infoVal}>{punishment.dueDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle" size={18} color={colors.textMuted} />
            <Text style={styles.infoLabel}>Reason</Text>
            <Text style={styles.infoVal}>3 missed days</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="hardware-chip" size={18} color={colors.textMuted} />
            <Text style={styles.infoLabel}>Issued by</Text>
            <Text style={styles.infoVal}>CoupleCore AI</Text>
          </View>
        </View>

        <View style={styles.whyCard}>
          <Text style={styles.whyTitle}>Why punishments?</Text>
          <Text style={styles.whyText}>
            Missing three days in a row breaks your streak and momentum. A lighthearted
            punishment — witnessed by your partner — is a fun way to bounce back and
            recommit to your health goals together.
          </Text>
        </View>

        {isMine && !punishment.completed && (
          <TouchableOpacity
            style={styles.cta}
            onPress={async () => {
              await completePunishment(punishment.id);
              nav.goBack();
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.ctaText}>I Completed It!</Text>
          </TouchableOpacity>
        )}

        {punishment.completed && (
          <View style={styles.doneBanner}>
            <Ionicons name="trophy" size={24} color={colors.accent} />
            <Text style={styles.doneText}>
              Completed on {punishment.completedAt?.slice(0, 10)}. Debt paid — now get back on track!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
  content: { padding: spacing.lg, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 16 },
  emoji: { fontSize: 80 },
  liveTag: {
    backgroundColor: colors.punish + '33',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: 12,
  },
  liveTagText: { color: colors.punish, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    gap: 14,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { color: colors.textMuted, fontSize: 13, flex: 1 },
  infoVal: { color: colors.text, fontWeight: '700', fontSize: 14 },
  whyCard: {
    backgroundColor: colors.secondary + '18',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.secondary + '33',
    marginBottom: 24,
  },
  whyTitle: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 8 },
  whyText: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  cta: {
    backgroundColor: colors.punish,
    borderRadius: radius.xl,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.button,
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  doneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.success + '18',
    borderRadius: radius.lg,
    padding: 16,
  },
  doneText: { color: colors.text, flex: 1, fontSize: 14, lineHeight: 20 },
  missing: { color: colors.text, textAlign: 'center', marginTop: 100 },
  backLink: { color: colors.primary, textAlign: 'center', marginTop: 16 },
});
