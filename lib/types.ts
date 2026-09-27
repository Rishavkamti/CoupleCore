export type FitnessGoal =
  | 'weight_loss'
  | 'muscle_gain'
  | 'flexibility'
  | 'endurance'
  | 'stress_relief'
  | 'couple_bonding';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type TimePreference = '15min' | '30min' | '45min' | '60min';

export type ExerciseType =
  | 'cardio'
  | 'strength'
  | 'yoga'
  | 'hiit'
  | 'dance'
  | 'partner';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  goals: FitnessGoal[];
  level: FitnessLevel;
  preferredTime: TimePreference;
  preferredTypes: ExerciseType[];
  focusAreas: string[];
  /** Free-text goals the AI should factor in (e.g. "increase height") */
  customNote: string;
  coupleCode: string;
  partnerId: string | null;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  reps?: number;
  sets?: number;
  type: ExerciseType;
  isPartner: boolean;
  emoji: string;
  instructions: string[];
}

export interface DailyRoutine {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  totalDuration: number; // minutes
  exercises: Exercise[];
  difficulty: FitnessLevel;
  motivationalQuote: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  completed: boolean;
  completedAt?: string;
}

export interface DayProgress {
  date: string;
  userId: string;
  routineId: string;
  exercises: ExerciseProgress[];
  completed: boolean;
  completedAt?: string;
  percentage: number;
}

export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  consecutiveMisses: number;
  lastCompletedDate: string | null;
  totalWorkouts: number;
}

export type PunishmentType =
  | 'plank_challenge'
  | 'burpee_blast'
  | 'cold_shower'
  | 'partner_choice'
  | 'extra_cardio'
  | 'dance_dare'
  | 'compliment_marathon'
  | 'chore_swap';

export interface Punishment {
  id: string;
  type: PunishmentType;
  title: string;
  description: string;
  emoji: string;
  assignedTo: string; // userId who failed
  assignedBy: string; // system or partner
  createdAt: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface CoupleData {
  code: string;
  partner1Id: string;
  partner2Id: string | null;
  createdAt: string;
  totalCoupleWorkouts: number;
  coupleStreak: number;
}

export interface AppState {
  user: UserProfile | null;
  partner: UserProfile | null;
  couple: CoupleData | null;
  todayRoutine: DailyRoutine | null;
  userProgress: DayProgress[];
  partnerProgress: DayProgress[];
  userStreak: StreakData | null;
  partnerStreak: StreakData | null;
  punishments: Punishment[];
  onboardingComplete: boolean;
  questionnaireComplete: boolean;
}

export const GOAL_LABELS: Record<FitnessGoal, { label: string; emoji: string }> = {
  weight_loss: { label: 'Weight Loss', emoji: '🔥' },
  muscle_gain: { label: 'Muscle Gain', emoji: '💪' },
  flexibility: { label: 'Flexibility', emoji: '🧘' },
  endurance: { label: 'Endurance', emoji: '🏃' },
  stress_relief: { label: 'Stress Relief', emoji: '😌' },
  couple_bonding: { label: 'Couple Bonding', emoji: '💕' },
};

export const LEVEL_LABELS: Record<FitnessLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const TIME_LABELS: Record<TimePreference, string> = {
  '15min': '15 minutes',
  '30min': '30 minutes',
  '45min': '45 minutes',
  '60min': '60 minutes',
};

export const TYPE_LABELS: Record<ExerciseType, { label: string; emoji: string }> = {
  cardio: { label: 'Cardio', emoji: '❤️' },
  strength: { label: 'Strength', emoji: '🏋️' },
  yoga: { label: 'Yoga', emoji: '🧘' },
  hiit: { label: 'HIIT', emoji: '⚡' },
  dance: { label: 'Dance', emoji: '💃' },
  partner: { label: 'Partner Moves', emoji: '🤝' },
};

export const FOCUS_AREAS = [
  'Full Body',
  'Core',
  'Arms',
  'Legs',
  'Back',
  'Glutes',
  'Cardio Health',
  'Balance',
  'Mobility',
  'Posture & Height',
];

export const AVATARS = ['😊', '😎', '🥰', '💪', '🌟', '🔥', '🦄', '🦊', '🐼', '🦁', '🐯', '🦋'];
