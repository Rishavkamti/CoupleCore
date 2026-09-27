import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState,
  UserProfile,
  CoupleData,
  DailyRoutine,
  DayProgress,
  StreakData,
  Punishment,
} from './types';

const KEYS = {
  USER: '@couplecore_user',
  PARTNER: '@couplecore_partner',
  COUPLE: '@couplecore_couple',
  ROUTINE: '@couplecore_routine',
  USER_PROGRESS: '@couplecore_user_progress',
  PARTNER_PROGRESS: '@couplecore_partner_progress',
  USER_STREAK: '@couplecore_user_streak',
  PARTNER_STREAK: '@couplecore_partner_streak',
  PUNISHMENTS: '@couplecore_punishments',
  ONBOARDING: '@couplecore_onboarding',
  QUESTIONNAIRE: '@couplecore_questionnaire',
  COUPLE_REGISTRY: '@couplecore_registry',
};

async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadAppState(): Promise<Partial<AppState>> {
  const [
    user,
    partner,
    couple,
    todayRoutine,
    userProgress,
    partnerProgress,
    userStreak,
    partnerStreak,
    punishments,
    onboardingComplete,
    questionnaireComplete,
  ] = await Promise.all([
    get<UserProfile>(KEYS.USER),
    get<UserProfile>(KEYS.PARTNER),
    get<CoupleData>(KEYS.COUPLE),
    get<DailyRoutine>(KEYS.ROUTINE),
    get<DayProgress[]>(KEYS.USER_PROGRESS),
    get<DayProgress[]>(KEYS.PARTNER_PROGRESS),
    get<StreakData>(KEYS.USER_STREAK),
    get<StreakData>(KEYS.PARTNER_STREAK),
    get<Punishment[]>(KEYS.PUNISHMENTS),
    get<boolean>(KEYS.ONBOARDING),
    get<boolean>(KEYS.QUESTIONNAIRE),
  ]);

  return {
    user,
    partner,
    couple,
    todayRoutine,
    userProgress: userProgress || [],
    partnerProgress: partnerProgress || [],
    userStreak,
    partnerStreak,
    punishments: punishments || [],
    onboardingComplete: onboardingComplete || false,
    questionnaireComplete: questionnaireComplete || false,
  };
}

export async function saveUser(user: UserProfile): Promise<void> {
  await set(KEYS.USER, user);
}

export async function savePartner(partner: UserProfile | null): Promise<void> {
  if (partner) await set(KEYS.PARTNER, partner);
  else await AsyncStorage.removeItem(KEYS.PARTNER);
}

export async function saveCouple(couple: CoupleData | null): Promise<void> {
  if (couple) await set(KEYS.COUPLE, couple);
  else await AsyncStorage.removeItem(KEYS.COUPLE);
}

export async function saveRoutine(routine: DailyRoutine): Promise<void> {
  await set(KEYS.ROUTINE, routine);
}

export async function saveUserProgress(progress: DayProgress[]): Promise<void> {
  await set(KEYS.USER_PROGRESS, progress);
}

export async function savePartnerProgress(progress: DayProgress[]): Promise<void> {
  await set(KEYS.PARTNER_PROGRESS, progress);
}

export async function saveUserStreak(streak: StreakData): Promise<void> {
  await set(KEYS.USER_STREAK, streak);
}

export async function savePartnerStreak(streak: StreakData): Promise<void> {
  await set(KEYS.PARTNER_STREAK, streak);
}

export async function savePunishments(punishments: Punishment[]): Promise<void> {
  await set(KEYS.PUNISHMENTS, punishments);
}

export async function saveOnboarding(complete: boolean): Promise<void> {
  await set(KEYS.ONBOARDING, complete);
}

export async function saveQuestionnaire(complete: boolean): Promise<void> {
  await set(KEYS.QUESTIONNAIRE, complete);
}

// Couple registry for pairing simulation
interface CoupleRegistry {
  [code: string]: {
    host: UserProfile;
    guest: UserProfile | null;
    couple: CoupleData;
  };
}

export async function getCoupleRegistry(): Promise<CoupleRegistry> {
  return (await get<CoupleRegistry>(KEYS.COUPLE_REGISTRY)) || {};
}

export async function saveCoupleRegistry(registry: CoupleRegistry): Promise<void> {
  await set(KEYS.COUPLE_REGISTRY, registry);
}

export async function clearAllData(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((k) => AsyncStorage.removeItem(k)));
}
