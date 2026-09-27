import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { AVATARS } from '../lib/types';
import { colors, radius, spacing, shadows } from '../lib/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '💕',
    title: 'CoupleCore',
    subtitle: 'Workout as a couple.\nGrow healthier every day.',
  },
  {
    emoji: '🤖',
    title: 'AI Daily Plans',
    subtitle: 'Answer a few questions and get\na custom routine made for two.',
  },
  {
    emoji: '📡',
    title: 'Live Progress',
    subtitle: 'Connect with your partner and\ncheer each other on in real time.',
  },
  {
    emoji: '⚡',
    title: 'Stay Accountable',
    subtitle: 'Miss 3 days in a row?\nA fun punishment keeps you honest!',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const scrollRef = useRef<ScrollView>(null);

  const isProfile = step >= SLIDES.length;

  const next = () => {
    if (step < SLIDES.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      scrollRef.current?.scrollTo({ x: nextStep * width, animated: true });
    } else if (step === SLIDES.length - 1) {
      setStep(SLIDES.length);
    }
  };

  const finish = async () => {
    await completeOnboarding(name || 'Athlete', avatar);
  };

  if (isProfile) {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.profileContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.profileEmoji}>✨</Text>
            <Text style={styles.profileTitle}>Create your profile</Text>
            <Text style={styles.profileSub}>This is how your partner will see you</Text>

            <Text style={styles.fieldLabel}>Your name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={24}
              returnKeyType="done"
              autoFocus
            />

            <Text style={styles.fieldLabel}>Pick an avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.avatarBtn, avatar === a && styles.avatarSelected]}
                  onPress={() => setAvatar(a)}
                >
                  <Text style={styles.avatarEmoji}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.cta, !name.trim() && styles.ctaDisabled]}
              onPress={finish}
              disabled={!name.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>Let's Go</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        {step < SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => setStep(SLIDES.length)}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={styles.emojiCircle}>
              <Text style={styles.slideEmoji}>{s.emoji}</Text>
            </View>
            <Text style={styles.slideTitle}>{s.title}</Text>
            <Text style={styles.slideSub}>{s.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.cta} onPress={next} activeOpacity={0.85}>
          <Text style={styles.ctaText}>
            {step === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  skip: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emojiCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary + '22',
    borderWidth: 2,
    borderColor: colors.primary + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  slideEmoji: {
    fontSize: 64,
  },
  slideTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideSub: {
    color: colors.textSecondary,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottom: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
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
  ctaDisabled: {
    opacity: 0.45,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  profileContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  profileEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  profileTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  profileSub: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    color: colors.text,
    fontSize: 17,
    marginBottom: spacing.lg,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.xl,
  },
  avatarBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '33',
  },
  avatarEmoji: {
    fontSize: 28,
  },
});
