import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  UserProfile,
  CoupleData,
  DailyRoutine,
  DayProgress,
  StreakData,
  Punishment,
  FitnessGoal,
  FitnessLevel,
  TimePreference,
  ExerciseType,
} from './types';
import * as storage from './storage';
import { generateDailyRoutine, generateCoupleCode, createId, todayStr, generatePunishment } from './ai';
import {
  createInitialStreak,
  onWorkoutComplete,
  evaluateMisses,
} from './streaks';

interface AppContextValue {
  loading: boolean;
  user: UserProfile | null;
  partner: UserProfile | null;
  couple: CoupleData | null;
  todayRoutine: DailyRoutine | null;
  userProgress: DayProgress[];
  partnerProgress: DayProgress[];
  todayUserProgress: DayProgress | null;
  todayPartnerProgress: DayProgress | null;
  userStreak: StreakData | null;
  partnerStreak: StreakData | null;
  punishments: Punishment[];
  activePunishments: Punishment[];
  onboardingComplete: boolean;
  questionnaireComplete: boolean;
  // Actions
  completeOnboarding: (name: string, avatar: string) => Promise<void>;
  createCouple: () => Promise<string>;
  joinCouple: (code: string) => Promise<{ ok: boolean; error?: string }>;
  skipPartner: () => Promise<void>;
  completeQuestionnaire: (data: {
    goals: FitnessGoal[];
    level: FitnessLevel;
    preferredTime: TimePreference;
    preferredTypes: ExerciseType[];
    focusAreas: string[];
    customNote: string;
  }) => Promise<void>;
  toggleExercise: (exerciseId: string) => Promise<void>;
  completePunishment: (punishmentId: string) => Promise<void>;
  applyDemoPunishment: () => Promise<void>;
  regenerateRoutine: () => Promise<void>;
  simulatePartnerProgress: () => Promise<void>;
  refreshMissCheck: () => Promise<void>;
  resetApp: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [couple, setCouple] = useState<CoupleData | null>(null);
  const [todayRoutine, setTodayRoutine] = useState<DailyRoutine | null>(null);
  const [userProgress, setUserProgress] = useState<DayProgress[]>([]);
  const [partnerProgress, setPartnerProgress] = useState<DayProgress[]>([]);
  const [userStreak, setUserStreak] = useState<StreakData | null>(null);
  const [partnerStreak, setPartnerStreak] = useState<StreakData | null>(null);
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);

  const today = todayStr();

  const todayUserProgress =
    userProgress.find((p) => p.date === today) || null;
  const todayPartnerProgress =
    partnerProgress.find((p) => p.date === today) || null;
  const activePunishments = punishments.filter((p) => !p.completed);

  useEffect(() => {
    (async () => {
      const state = await storage.loadAppState();
      setUser(state.user || null);
      setPartner(state.partner || null);
      setCouple(state.couple || null);
      setUserProgress(state.userProgress || []);
      setPartnerProgress(state.partnerProgress || []);
      setUserStreak(state.userStreak || null);
      setPartnerStreak(state.partnerStreak || null);
      setPunishments(state.punishments || []);
      setOnboardingComplete(state.onboardingComplete || false);
      setQuestionnaireComplete(state.questionnaireComplete || false);

      // Load or generate today's routine
      let routine = state.todayRoutine || null;
      if (state.user && state.questionnaireComplete) {
        if (!routine || routine.date !== today) {
          routine = generateDailyRoutine(state.user, state.partner || null);
          await storage.saveRoutine(routine);
        }
        setTodayRoutine(routine);

        // Ensure today's progress entry exists
        const up = state.userProgress || [];
        if (!up.find((p) => p.date === today) && routine) {
          const newProg: DayProgress = {
            date: today,
            userId: state.user.id,
            routineId: routine.id,
            exercises: routine.exercises.map((e) => ({
              exerciseId: e.id,
              completed: false,
            })),
            completed: false,
            percentage: 0,
          };
          const updated = [...up, newProg];
          setUserProgress(updated);
          await storage.saveUserProgress(updated);
        }

        // Partner progress for today
        if (state.partner) {
          const pp = state.partnerProgress || [];
          if (!pp.find((p) => p.date === today) && routine) {
            const newPP: DayProgress = {
              date: today,
              userId: state.partner.id,
              routineId: routine.id,
              exercises: routine.exercises.map((e) => ({
                exerciseId: e.id,
                completed: false,
              })),
              completed: false,
              percentage: 0,
            };
            const updatedPP = [...pp, newPP];
            setPartnerProgress(updatedPP);
            await storage.savePartnerProgress(updatedPP);
          }
        }

        // Evaluate misses / punishments
        if (state.userStreak) {
          const { streak, newPunishments } = evaluateMisses(
            state.userStreak,
            state.userProgress || [],
            state.punishments || []
          );
          if (JSON.stringify(streak) !== JSON.stringify(state.userStreak)) {
            setUserStreak(streak);
            await storage.saveUserStreak(streak);
          }
          if (newPunishments.length > 0) {
            const all = [...(state.punishments || []), ...newPunishments];
            setPunishments(all);
            await storage.savePunishments(all);
          }
        }
      } else if (routine) {
        setTodayRoutine(routine);
      }

      setLoading(false);
    })();
  }, []);

  const completeOnboarding = useCallback(
    async (name: string, avatar: string) => {
      const newUser: UserProfile = {
        id: createId(),
        name: name.trim() || 'Athlete',
        avatar,
        goals: [],
        level: 'beginner',
        preferredTime: '30min',
        preferredTypes: [],
        focusAreas: [],
        customNote: '',
        coupleCode: '',
        partnerId: null,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      await storage.saveUser(newUser);
      const streak = createInitialStreak(newUser.id);
      setUserStreak(streak);
      await storage.saveUserStreak(streak);
      setOnboardingComplete(true);
      await storage.saveOnboarding(true);
    },
    []
  );

  const createCouple = useCallback(async () => {
    if (!user) return '';
    const code = generateCoupleCode();
    const coupleData: CoupleData = {
      code,
      partner1Id: user.id,
      partner2Id: null,
      createdAt: new Date().toISOString(),
      totalCoupleWorkouts: 0,
      coupleStreak: 0,
    };
    const updatedUser = { ...user, coupleCode: code };
    setUser(updatedUser);
    setCouple(coupleData);
    await storage.saveUser(updatedUser);
    await storage.saveCouple(coupleData);

    const registry = await storage.getCoupleRegistry();
    registry[code] = { host: updatedUser, guest: null, couple: coupleData };
    await storage.saveCoupleRegistry(registry);

    return code;
  }, [user]);

  const joinCouple = useCallback(
    async (code: string) => {
      if (!user) return { ok: false, error: 'No user' };
      const normalized = code.trim().toUpperCase();
      if (normalized.length < 4) {
        return { ok: false, error: 'Enter a valid 6-character code' };
      }

      const registry = await storage.getCoupleRegistry();
      const entry = registry[normalized];

      // Demo mode: if code not found, create a simulated partner
      if (!entry) {
        // Accept any 6-char code in demo and create virtual partner
        if (normalized.length === 6) {
          const virtualPartner: UserProfile = {
            id: createId(),
            name: 'Alex',
            avatar: '🥰',
            goals: ['couple_bonding', 'endurance'],
            level: 'intermediate',
            preferredTime: '30min',
            preferredTypes: ['partner', 'hiit'],
            focusAreas: ['Full Body', 'Core'],
            customNote: '',
            coupleCode: normalized,
            partnerId: user.id,
            createdAt: new Date().toISOString(),
          };
          const coupleData: CoupleData = {
            code: normalized,
            partner1Id: virtualPartner.id,
            partner2Id: user.id,
            createdAt: new Date().toISOString(),
            totalCoupleWorkouts: 0,
            coupleStreak: 0,
          };
          const updatedUser = {
            ...user,
            coupleCode: normalized,
            partnerId: virtualPartner.id,
          };
          setUser(updatedUser);
          setPartner(virtualPartner);
          setCouple(coupleData);
          const pStreak = createInitialStreak(virtualPartner.id);
          // Give partner a bit of history for demo
          pStreak.currentStreak = 2;
          pStreak.totalWorkouts = 5;
          pStreak.longestStreak = 4;
          setPartnerStreak(pStreak);

          await storage.saveUser(updatedUser);
          await storage.savePartner(virtualPartner);
          await storage.saveCouple(coupleData);
          await storage.savePartnerStreak(pStreak);
          return { ok: true };
        }
        return { ok: false, error: 'Couple code not found' };
      }

      if (entry.guest && entry.guest.id !== user.id) {
        return { ok: false, error: 'This couple is already complete' };
      }

      const coupleData: CoupleData = {
        ...entry.couple,
        partner2Id: user.id,
      };
      const updatedUser = {
        ...user,
        coupleCode: normalized,
        partnerId: entry.host.id,
      };
      const hostUpdated = { ...entry.host, partnerId: user.id };

      setUser(updatedUser);
      setPartner(hostUpdated);
      setCouple(coupleData);
      const pStreak = createInitialStreak(hostUpdated.id);
      setPartnerStreak(pStreak);

      registry[normalized] = {
        host: hostUpdated,
        guest: updatedUser,
        couple: coupleData,
      };
      await storage.saveCoupleRegistry(registry);
      await storage.saveUser(updatedUser);
      await storage.savePartner(hostUpdated);
      await storage.saveCouple(coupleData);
      await storage.savePartnerStreak(pStreak);
      return { ok: true };
    },
    [user]
  );

  const skipPartner = useCallback(async () => {
    // Allow continuing solo — can pair later
    if (!user) return;
    const code = user.coupleCode || generateCoupleCode();
    const updated = { ...user, coupleCode: code };
    setUser(updated);
    await storage.saveUser(updated);
  }, [user]);

  const completeQuestionnaire = useCallback(
    async (data: {
      goals: FitnessGoal[];
      level: FitnessLevel;
      preferredTime: TimePreference;
      preferredTypes: ExerciseType[];
      focusAreas: string[];
      customNote: string;
    }) => {
      if (!user) return;
      const updated: UserProfile = { ...user, ...data };
      setUser(updated);
      await storage.saveUser(updated);

      const routine = generateDailyRoutine(updated, partner);
      setTodayRoutine(routine);
      await storage.saveRoutine(routine);

      const prog: DayProgress = {
        date: today,
        userId: updated.id,
        routineId: routine.id,
        exercises: routine.exercises.map((e) => ({
          exerciseId: e.id,
          completed: false,
        })),
        completed: false,
        percentage: 0,
      };
      const up = [...userProgress.filter((p) => p.date !== today), prog];
      setUserProgress(up);
      await storage.saveUserProgress(up);

      if (partner) {
        const pp: DayProgress = {
          date: today,
          userId: partner.id,
          routineId: routine.id,
          exercises: routine.exercises.map((e) => ({
            exerciseId: e.id,
            completed: false,
          })),
          completed: false,
          percentage: 0,
        };
        const ppl = [...partnerProgress.filter((p) => p.date !== today), pp];
        setPartnerProgress(ppl);
        await storage.savePartnerProgress(ppl);
      }

      setQuestionnaireComplete(true);
      await storage.saveQuestionnaire(true);
    },
    [user, partner, userProgress, partnerProgress, today]
  );

  const toggleExercise = useCallback(
    async (exerciseId: string) => {
      if (!user || !todayRoutine) return;

      let progress = userProgress.find((p) => p.date === today);
      if (!progress) {
        progress = {
          date: today,
          userId: user.id,
          routineId: todayRoutine.id,
          exercises: todayRoutine.exercises.map((e) => ({
            exerciseId: e.id,
            completed: false,
          })),
          completed: false,
          percentage: 0,
        };
      }

      const exercises = progress.exercises.map((e) =>
        e.exerciseId === exerciseId
          ? {
              ...e,
              completed: !e.completed,
              completedAt: !e.completed ? new Date().toISOString() : undefined,
            }
          : e
      );

      const doneCount = exercises.filter((e) => e.completed).length;
      const percentage = Math.round((doneCount / exercises.length) * 100);
      const completed = percentage === 100;

      const updated: DayProgress = {
        ...progress,
        exercises,
        percentage,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
      };

      const list = [
        ...userProgress.filter((p) => p.date !== today),
        updated,
      ];
      setUserProgress(list);
      await storage.saveUserProgress(list);

      if (completed && userStreak) {
        const wasAlreadyComplete = progress.completed;
        if (!wasAlreadyComplete) {
          const newStreak = onWorkoutComplete(userStreak, today);
          setUserStreak(newStreak);
          await storage.saveUserStreak(newStreak);

          if (couple) {
            const c = {
              ...couple,
              totalCoupleWorkouts: couple.totalCoupleWorkouts + 1,
            };
            setCouple(c);
            await storage.saveCouple(c);
          }
        }
      }
    },
    [user, todayRoutine, userProgress, userStreak, couple, today]
  );

  const completePunishment = useCallback(
    async (punishmentId: string) => {
      const updated = punishments.map((p) =>
        p.id === punishmentId
          ? { ...p, completed: true, completedAt: new Date().toISOString() }
          : p
      );
      setPunishments(updated);
      await storage.savePunishments(updated);
    },
    [punishments]
  );

  const applyDemoPunishment = useCallback(async () => {
    if (!user) return;
    const p = generatePunishment(user.id);
    const all = [...punishments, p];
    setPunishments(all);
    await storage.savePunishments(all);
    if (userStreak) {
      const s = { ...userStreak, consecutiveMisses: 3, currentStreak: 0 };
      setUserStreak(s);
      await storage.saveUserStreak(s);
    }
  }, [user, punishments, userStreak]);

  const regenerateRoutine = useCallback(async () => {
    if (!user) return;
    const routine = generateDailyRoutine(user, partner);
    setTodayRoutine(routine);
    await storage.saveRoutine(routine);

    const prog: DayProgress = {
      date: today,
      userId: user.id,
      routineId: routine.id,
      exercises: routine.exercises.map((e) => ({
        exerciseId: e.id,
        completed: false,
      })),
      completed: false,
      percentage: 0,
    };
    const up = [...userProgress.filter((p) => p.date !== today), prog];
    setUserProgress(up);
    await storage.saveUserProgress(up);

    if (partner) {
      const pp: DayProgress = {
        date: today,
        userId: partner.id,
        routineId: routine.id,
        exercises: routine.exercises.map((e) => ({
          exerciseId: e.id,
          completed: false,
        })),
        completed: false,
        percentage: 0,
      };
      const ppl = [...partnerProgress.filter((p) => p.date !== today), pp];
      setPartnerProgress(ppl);
      await storage.savePartnerProgress(ppl);
    }
  }, [user, partner, userProgress, partnerProgress, today]);

  // Simulate partner doing exercises in real-time for demo
  const simulatePartnerProgress = useCallback(async () => {
    if (!partner || !todayRoutine) return;

    let progress = partnerProgress.find((p) => p.date === today);
    if (!progress) {
      progress = {
        date: today,
        userId: partner.id,
        routineId: todayRoutine.id,
        exercises: todayRoutine.exercises.map((e) => ({
          exerciseId: e.id,
          completed: false,
        })),
        completed: false,
        percentage: 0,
      };
    }

    const incomplete = progress.exercises.filter((e) => !e.completed);
    if (incomplete.length === 0) return;

    // Complete 1-2 random exercises
    const toComplete = incomplete.slice(0, Math.min(2, incomplete.length));
    const ids = new Set(toComplete.map((e) => e.exerciseId));

    const exercises = progress.exercises.map((e) =>
      ids.has(e.exerciseId)
        ? { ...e, completed: true, completedAt: new Date().toISOString() }
        : e
    );

    const doneCount = exercises.filter((e) => e.completed).length;
    const percentage = Math.round((doneCount / exercises.length) * 100);
    const completed = percentage === 100;

    const updated: DayProgress = {
      ...progress,
      exercises,
      percentage,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    };

    const list = [
      ...partnerProgress.filter((p) => p.date !== today),
      updated,
    ];
    setPartnerProgress(list);
    await storage.savePartnerProgress(list);

    if (completed && partnerStreak) {
      const newStreak = onWorkoutComplete(partnerStreak, today);
      setPartnerStreak(newStreak);
      await storage.savePartnerStreak(newStreak);
    }
  }, [partner, todayRoutine, partnerProgress, partnerStreak, today]);

  const refreshMissCheck = useCallback(async () => {
    if (!userStreak || !user) return;
    const { streak, newPunishments } = evaluateMisses(
      userStreak,
      userProgress,
      punishments
    );
    setUserStreak(streak);
    await storage.saveUserStreak(streak);
    if (newPunishments.length > 0) {
      const all = [...punishments, ...newPunishments];
      setPunishments(all);
      await storage.savePunishments(all);
    }
  }, [userStreak, user, userProgress, punishments]);

  const resetApp = useCallback(async () => {
    await storage.clearAllData();
    setUser(null);
    setPartner(null);
    setCouple(null);
    setTodayRoutine(null);
    setUserProgress([]);
    setPartnerProgress([]);
    setUserStreak(null);
    setPartnerStreak(null);
    setPunishments([]);
    setOnboardingComplete(false);
    setQuestionnaireComplete(false);
  }, []);

  const updateUserName = useCallback(
    async (name: string) => {
      if (!user) return;
      const updated = { ...user, name };
      setUser(updated);
      await storage.saveUser(updated);
    },
    [user]
  );

  return (
    <AppContext.Provider
      value={{
        loading,
        user,
        partner,
        couple,
        todayRoutine,
        userProgress,
        partnerProgress,
        todayUserProgress,
        todayPartnerProgress,
        userStreak,
        partnerStreak,
        punishments,
        activePunishments,
        onboardingComplete,
        questionnaireComplete,
        completeOnboarding,
        createCouple,
        joinCouple,
        skipPartner,
        completeQuestionnaire,
        toggleExercise,
        completePunishment,
        applyDemoPunishment,
        regenerateRoutine,
        simulatePartnerProgress,
        refreshMissCheck,
        resetApp,
        updateUserName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
