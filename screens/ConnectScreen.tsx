import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { colors, radius, spacing, shadows } from '../lib/theme';

interface Props {
  onDone: () => void;
}

export default function ConnectScreen({ onDone }: Props) {
  const { user, createCouple, joinCouple, skipPartner } = useApp();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    const c = await createCouple();
    setGeneratedCode(c);
    setMode('create');
    setLoading(false);
  };

  const handleJoin = async () => {
    setError('');
    setLoading(true);
    const result = await joinCouple(code);
    setLoading(false);
    if (result.ok) {
      onDone();
    } else {
      setError(result.error || 'Could not join');
    }
  };

  const handleSkip = async () => {
    await skipPartner();
    onDone();
  };

  if (mode === 'create') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 48 }}>🔗</Text>
          </View>
          <Text style={styles.title}>Your Couple Code</Text>
          <Text style={styles.sub}>
            Share this code with your partner so they can connect and train with you
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{generatedCode}</Text>
          </View>

          <Text style={styles.hint}>
            Your partner opens CoupleCore → Join with Code → enters this code
          </Text>

          <TouchableOpacity style={styles.cta} onPress={onDone} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondary} onPress={() => setMode('choose')}>
            <Text style={styles.secondaryText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === 'join') {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.back} onPress={() => setMode('choose')}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 48 }}>💞</Text>
            </View>
            <Text style={styles.title}>Join Your Partner</Text>
            <Text style={styles.sub}>Enter the 6-character code they shared with you</Text>

            <TextInput
              style={styles.codeInput}
              placeholder="ABC123"
              placeholderTextColor={colors.textMuted}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleJoin}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.demoHint}>
              Demo tip: enter any 6-character code (e.g. LOVE22) to connect with a virtual partner
            </Text>

            <TouchableOpacity
              style={[styles.cta, code.length < 6 && styles.ctaDisabled]}
              onPress={handleJoin}
              disabled={code.length < 6 || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.ctaText}>Connect</Text>
                  <Ionicons name="heart" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Hey {user?.name}! {user?.avatar}</Text>
        <Text style={styles.title}>Connect as a Couple</Text>
        <Text style={styles.sub}>
          Link with your partner to share routines, track progress live, and stay accountable together
        </Text>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={[styles.optionIcon, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name="add-circle" size={32} color={colors.primary} />
          </View>
          <View style={styles.optionBody}>
            <Text style={styles.optionTitle}>Create Couple Code</Text>
            <Text style={styles.optionDesc}>Generate a code and invite your partner</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setMode('join')}
          activeOpacity={0.8}
        >
          <View style={[styles.optionIcon, { backgroundColor: colors.partner2 + '22' }]}>
            <Ionicons name="enter" size={32} color={colors.partner2} />
          </View>
          <View style={styles.optionBody}>
            <Text style={styles.optionTitle}>Join with Code</Text>
            <Text style={styles.optionDesc}>Enter the code your partner shared</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Continue solo for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  back: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
  greeting: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBody: { flex: 1 },
  optionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  optionDesc: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  skipBtn: { marginTop: spacing.lg, alignItems: 'center', padding: 12 },
  skipText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  codeBox: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  codeText: {
    color: colors.primary,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 8,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  codeInput: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 20,
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  demoHint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
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
  ctaDisabled: { opacity: 0.45 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  secondary: { marginTop: 16, alignItems: 'center', padding: 12 },
  secondaryText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
});
