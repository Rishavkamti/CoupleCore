import { DayProgress, StreakData, Punishment } from './types';
import { generatePunishment, todayStr } from './ai';

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T12:00:00');
  const db = new Date(b + 'T12:00:00');
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function createInitialStreak(userId: string): StreakData {
  return {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    consecutiveMisses: 0,
    lastCompletedDate: null,
    totalWorkouts: 0,
  };
}

/** Call when user completes today's routine */
export function onWorkoutComplete(streak: StreakData, date: string = todayStr()): StreakData {
  const last = streak.lastCompletedDate;
  let currentStreak = streak.currentStreak;

  if (!last) {
    currentStreak = 1;
  } else {
    const gap = daysBetween(last, date);
    if (gap === 0) {
      // already counted today
      return streak;
    } else if (gap === 1) {
      currentStreak = streak.currentStreak + 1;
    } else {
      currentStreak = 1;
    }
  }

  return {
    ...streak,
    currentStreak,
    longestStreak: Math.max(streak.longestStreak, currentStreak),
    consecutiveMisses: 0,
    lastCompletedDate: date,
    totalWorkouts: streak.totalWorkouts + 1,
  };
}

/**
 * Evaluate misses based on progress history.
 * Returns updated streak and any new punishments.
 */
export function evaluateMisses(
  streak: StreakData,
  progressList: DayProgress[],
  existingPunishments: Punishment[]
): { streak: StreakData; newPunishments: Punishment[] } {
  const today = todayStr();
  const newPunishments: Punishment[] = [];

  // Check last 3 calendar days (not including today if not yet done — we check completed days)
  // Count consecutive days ending yesterday where workout was NOT completed
  let misses = 0;
  for (let i = 1; i <= 7; i++) {
    const date = dateOffset(-i);
    const dayProg = progressList.find((p) => p.date === date);
    if (dayProg && dayProg.completed) {
      break;
    }
    // If we have a lastCompletedDate and this date is on or before it, stop
    if (streak.lastCompletedDate && date <= streak.lastCompletedDate) {
      break;
    }
    // Only count misses after account creation / first activity window
    // Count as miss if the day has passed and no completion
    // For new users with no history, don't punish yet until they've had 3 days
    if (streak.totalWorkouts === 0 && !streak.lastCompletedDate && progressList.length === 0) {
      // Brand new — no misses yet
      break;
    }
    misses++;
  }

  // Also use stored consecutiveMisses if higher from explicit tracking
  const consecutiveMisses = Math.max(misses, 0);

  let updated = { ...streak, consecutiveMisses };

  // Reset streak if misses > 0 and last completion wasn't yesterday/today
  if (
    streak.lastCompletedDate &&
    daysBetween(streak.lastCompletedDate, today) > 1
  ) {
    updated.currentStreak = 0;
  }

  // Apply punishment at 3 consecutive misses
  if (consecutiveMisses >= 3) {
    const alreadyPunishedRecently = existingPunishments.some((p) => {
      const created = p.createdAt.slice(0, 10);
      return (
        p.assignedTo === streak.userId &&
        !p.completed &&
        daysBetween(created, today) <= 3
      );
    });

    if (!alreadyPunishedRecently) {
      newPunishments.push(generatePunishment(streak.userId));
      // Reset miss counter after punishment so it doesn't spam
      updated.consecutiveMisses = 0;
    }
  }

  return { streak: updated, newPunishments };
}

/** Explicitly mark a day as missed (e.g. end of day check) */
export function incrementMiss(streak: StreakData): StreakData {
  return {
    ...streak,
    consecutiveMisses: streak.consecutiveMisses + 1,
    currentStreak: 0,
  };
}

export function getWeekActivity(
  progressList: DayProgress[]
): { date: string; day: string; completed: boolean; percentage: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = dateOffset(-i);
    const d = new Date(date + 'T12:00:00');
    const prog = progressList.find((p) => p.date === date);
    result.push({
      date,
      day: days[d.getDay()],
      completed: prog?.completed || false,
      percentage: prog?.percentage || 0,
    });
  }
  return result;
}
