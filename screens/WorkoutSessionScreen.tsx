import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../lib/AppContext';
import { colors, radius, spacing } from '../lib/theme';

export default function WorkoutSessionScreen() {
  const nav = useNavigation();
  const { todayRoutine, todayUserProgress, toggleExercise } = useApp();
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [resting, setResting] = useState(false);
  const [finished, setFinished] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  const exercises = todayRoutine?.exercises || [];
  const current = exercises[index];
  const isDone = (id: string) =>
    todayUserProgress?.exercises.find((e) => e.exerciseId === id)?.completed || false;

  useEffect(() => {
    if (current) {
      setSecondsLeft(current.duration);
      setResting(false);
      setRunning(false);
    }
  }, [index, current?.id]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, secondsLeft > 0]);

  useEffect(() => {
    if (secondsLeft === 0 && running && current) {
      setRunning(false);
      // auto-complete
      if (!isDone(current.id)) {
        toggleExercise(current.id);
      }
      // go to rest or next
      if (index < exercises.length - 1) {
        setResting(true);
        setSecondsLeft(15);
        setRunning(true);
      } else {
        setFinished(true);
      }
    }
  }, [secondsLeft, running]);

  useEffect(() => {
    if (resting && secondsLeft === 0 && running) {
      setResting(false);
      setRunning(false);
      setIndex((i) => i + 1);
    }
  }, [resting, secondsLeft, running]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const skip = () => {
    setRunning(false);
    if (resting) {
      setResting(false);
      if (index < exercises.length - 1) setIndex(index + 1);
      else setFinished(true);
    } else {
      if (current && !isDone(current.id)) toggleExercise(current.id);
      if (index < exercises.length - 1) {
        setResting(true);
        setSecondsLeft(15);
        setRunning(true);
      } else {
        setFinished(true);
      }
    }
  };

  const prev = () => {
    if (index > 0) {
      setRunning(false);
      setResting(false);
      setIndex(index - 1);
    }
  };

  if (!todayRoutine || exercises.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.empty}>No exercises available</Text>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (finished) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.finish}>
          <Text style={{ fontSize: 72 }}>🎉</Text>
          <Text style={styles.finishTitle}>Workout Complete!</Text>
          <Text style={styles.finishSub}>
            You crushed all {exercises.length} exercises. Your partner will be proud!
          </Text>
          <TouchableOpacity style={styles.finishBtn} onPress={() => nav.goBack()}>
            <Text style={styles.finishBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.progressLabel}>
          {index + 1} / {exercises.length}
        </Text>
        <TouchableOpacity onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((index + (resting ? 0.5 : 0)) / exercises.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.body}>
        {resting ? (
          <>
            <Text style={styles.restLabel}>REST</Text>
            <Text style={styles.restSub}>Next up: {exercises[index + 1]?.name || 'Done!'}</Text>
          </>
        ) : (
          <>
            <Text style={styles.emoji}>{current.emoji}</Text>
            <Text style={styles.name}>{current.name}</Text>
            <Text style={styles.desc}>{current.description}</Text>
            {current.isPartner && (
              <View style={styles.duoBadge}>
                <Ionicons name="heart" size={14} color={colors.primary} />
                <Text style={styles.duoText}>Do this together!</Text>
              </View>
            )}
            {current.sets && current.reps && (
              <Text style={styles.reps}>
                {current.sets} sets × {current.reps} reps
              </Text>
            )}
          </>
        )}

        <Animated.View style={[styles.timerCircle, { transform: [{ scale: running ? pulse : 1 }] }]}>
          <Text style={[styles.timer, resting && { color: colors.partner2 }]}>
            {formatTime(secondsLeft)}
          </Text>
          <Text style={styles.timerLabel}>{resting ? 'rest' : 'remaining'}</Text>
        </Animated.View>

        {!resting && (
          <View style={styles.tips}>
            {current.instructions.slice(0, 3).map((ins, i) => (
              <Text key={i} style={styles.tip}>
                • {ins}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={prev} disabled={index === 0}>
          <Ionicons
            name="play-skip-back"
            size={28}
            color={index === 0 ? colors.textMuted : colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, running && styles.pauseBtn]}
          onPress={() => setRunning(!running)}
        >
          <Ionicons name={running ? 'pause' : 'play'} size={36} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.ctrlBtn} onPress={skip}>
          <Ionicons name="play-skip-forward" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>
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
    paddingTop: spacing.sm,
  },
  closeBtn: { padding: 4 },
  progressLabel: { color: colors.textSecondary, fontWeight: '700', fontSize: 14 },
  skipText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    marginHorizontal: spacing.md,
    marginTop: 12,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emoji: { fontSize: 64, marginBottom: 12 },
  name: { color: colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  desc: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  duoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary + '22',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: 12,
  },
  duoText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  reps: { color: colors.accent, fontWeight: '700', fontSize: 16, marginTop: 10 },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    backgroundColor: colors.primary + '15',
  },
  timer: { color: colors.text, fontSize: 42, fontWeight: '900' },
  timerLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  tips: { marginTop: 24, alignSelf: 'stretch' },
  tip: { color: colors.textMuted, fontSize: 13, marginBottom: 6, lineHeight: 18 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingBottom: 40,
    paddingTop: 16,
  },
  ctrlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtn: { backgroundColor: colors.secondary },
  restLabel: {
    color: colors.partner2,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
  },
  restSub: { color: colors.textSecondary, fontSize: 16, marginTop: 8 },
  finish: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  finishTitle: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 16 },
  finishSub: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    fontSize: 15,
  },
  finishBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 32,
  },
  finishBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  empty: { color: colors.text, textAlign: 'center', marginTop: 100 },
  backLink: { color: colors.primary, textAlign: 'center', marginTop: 16 },
});
