import {
  UserProfile,
  DailyRoutine,
  Exercise,
  FitnessLevel,
  ExerciseType,
  Punishment,
  PunishmentType,
} from './types';

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const EXERCISE_POOL: Omit<Exercise, 'id'>[] = [
  // Partner exercises
  {
    name: 'Partner Squats',
    description: 'Face each other, hold hands, and squat together in sync',
    duration: 60,
    reps: 15,
    sets: 3,
    type: 'partner',
    isPartner: true,
    emoji: '🤝',
    instructions: [
      'Stand facing your partner, feet shoulder-width apart',
      'Hold both hands firmly',
      'Squat down together, keeping backs straight',
      'Rise together and squeeze at the top',
      'Maintain eye contact and encourage each other!',
    ],
  },
  {
    name: 'Wheelbarrow Walk',
    description: 'One partner holds legs while the other walks on hands',
    duration: 45,
    type: 'partner',
    isPartner: true,
    emoji: '🏋️',
    instructions: [
      'Partner A gets in plank position',
      'Partner B lifts Partner A legs at the ankles',
      'Partner A walks forward on hands',
      'Switch roles after the duration',
      'Keep core tight the whole time',
    ],
  },
  {
    name: 'Partner Plank High-Five',
    description: 'Hold plank side by side and high-five alternately',
    duration: 45,
    reps: 20,
    type: 'partner',
    isPartner: true,
    emoji: '🙌',
    instructions: [
      'Both get into forearm or high plank',
      'Position yourselves side by side',
      'Raise opposite hands and high-five',
      'Alternate sides with control',
      'Keep hips stable — no rocking!',
    ],
  },
  {
    name: 'Seated Partner Twists',
    description: 'Sit back-to-back and pass an imaginary ball side to side',
    duration: 60,
    reps: 20,
    sets: 2,
    type: 'partner',
    isPartner: true,
    emoji: '🔄',
    instructions: [
      'Sit back-to-back with knees bent',
      'Hold a light object or just clasp hands',
      'Twist to pass it to one side',
      'Partner receives and twists the other way',
      'Keep core engaged throughout',
    ],
  },
  {
    name: 'Mirror Lunges',
    description: 'Face each other and lunge in perfect mirror sync',
    duration: 60,
    reps: 12,
    sets: 3,
    type: 'partner',
    isPartner: true,
    emoji: '🪞',
    instructions: [
      'Stand facing your partner',
      'Step forward into a lunge together',
      'Match depth and tempo',
      'Push back and switch legs',
      'Cheer each other on!',
    ],
  },
  {
    name: 'Couple Dance Cardio',
    description: 'Freestyle dance together to get the heart pumping',
    duration: 120,
    type: 'dance',
    isPartner: true,
    emoji: '💃',
    instructions: [
      'Put on your favorite upbeat song',
      'Dance freely together for 2 minutes',
      'Try to match energy levels',
      'Include spins, dips, or silly moves',
      'Laughing counts as cardio!',
    ],
  },
  {
    name: 'Partner Resistance Rows',
    description: 'Hold wrists and lean back, rowing against each other',
    duration: 45,
    reps: 15,
    sets: 3,
    type: 'partner',
    isPartner: true,
    emoji: '🚣',
    instructions: [
      'Stand facing each other, grip wrists',
      'Both lean back slightly',
      'One pulls while the other resists',
      'Switch pulling roles each rep',
      'Keep feet planted firmly',
    ],
  },
  {
    name: 'Double Leg Raises',
    description: 'Lie opposite, hold ankles, raise legs together',
    duration: 45,
    reps: 12,
    sets: 3,
    type: 'partner',
    isPartner: true,
    emoji: '🦵',
    instructions: [
      'Lie on your backs, heads opposite',
      'Hold each others ankles',
      'Raise legs toward ceiling together',
      'Lower slowly with control',
      'Keep lower backs pressed down',
    ],
  },
  // Solo but couple-friendly
  {
    name: 'Jumping Jacks',
    description: 'Classic full-body warm-up — do them side by side',
    duration: 45,
    type: 'cardio',
    isPartner: false,
    emoji: '⭐',
    instructions: [
      'Stand with feet together, arms at sides',
      'Jump feet out while raising arms overhead',
      'Jump back to start position',
      'Keep a steady rhythm',
      'Race your partner for extra fun!',
    ],
  },
  {
    name: 'Push-Up Challenge',
    description: 'Standard push-ups — see who does more',
    duration: 60,
    reps: 10,
    sets: 3,
    type: 'strength',
    isPartner: false,
    emoji: '💥',
    instructions: [
      'Start in high plank position',
      'Lower chest toward the floor',
      'Push back up to start',
      'Keep body in a straight line',
      'Modify on knees if needed',
    ],
  },
  {
    name: 'Mountain Climbers',
    description: 'Drive knees to chest in plank — high intensity',
    duration: 40,
    type: 'hiit',
    isPartner: false,
    emoji: '⛰️',
    instructions: [
      'Start in high plank',
      'Drive one knee toward chest',
      'Quickly switch legs',
      'Keep hips level',
      'Go as fast as you can with control',
    ],
  },
  {
    name: 'Bodyweight Squats',
    description: 'Foundation leg strength builder',
    duration: 45,
    reps: 15,
    sets: 3,
    type: 'strength',
    isPartner: false,
    emoji: '🦵',
    instructions: [
      'Feet shoulder-width apart',
      'Lower as if sitting in a chair',
      'Keep chest up and knees tracking toes',
      'Drive through heels to stand',
      'Squeeze glutes at the top',
    ],
  },
  {
    name: 'Plank Hold',
    description: 'Core endurance — hold and breathe',
    duration: 45,
    type: 'strength',
    isPartner: false,
    emoji: '🪵',
    instructions: [
      'Forearms on ground, elbows under shoulders',
      'Body in a straight line from head to heels',
      'Engage core and glutes',
      'Breathe steadily',
      'Don\'t let hips sag or pike up',
    ],
  },
  {
    name: 'Burpees',
    description: 'The ultimate full-body burner',
    duration: 40,
    reps: 8,
    sets: 3,
    type: 'hiit',
    isPartner: false,
    emoji: '🔥',
    instructions: [
      'Start standing',
      'Drop to a squat, hands on floor',
      'Jump feet back to plank',
      'Do a push-up (optional)',
      'Jump feet in and explode up',
    ],
  },
  {
    name: 'High Knees',
    description: 'Run in place driving knees up high',
    duration: 40,
    type: 'cardio',
    isPartner: false,
    emoji: '🏃',
    instructions: [
      'Stand tall, core engaged',
      'Drive knees up toward chest alternately',
      'Pump arms naturally',
      'Stay on the balls of your feet',
      'Maintain a quick pace',
    ],
  },
  {
    name: 'Lunges',
    description: 'Alternating forward lunges for leg power',
    duration: 50,
    reps: 12,
    sets: 3,
    type: 'strength',
    isPartner: false,
    emoji: '➡️',
    instructions: [
      'Step one foot forward',
      'Lower until both knees are at 90 degrees',
      'Front knee stays over ankle',
      'Push back to standing',
      'Alternate legs',
    ],
  },
  {
    name: 'Sun Salutation Flow',
    description: 'A flowing yoga sequence to open the body',
    duration: 90,
    type: 'yoga',
    isPartner: false,
    emoji: '🌅',
    instructions: [
      'Start in mountain pose',
      'Sweep arms up, fold forward',
      'Half-lift, step back to plank',
      'Lower to chaturanga, up-dog, down-dog',
      'Step forward and rise — repeat',
    ],
  },
  {
    name: 'Warrior II Hold',
    description: 'Build strength and focus in warrior stance',
    duration: 40,
    type: 'yoga',
    isPartner: false,
    emoji: '⚔️',
    instructions: [
      'Step feet wide apart',
      'Turn one foot out 90 degrees',
      'Bend front knee over ankle',
      'Arms extended parallel to floor',
      'Gaze over front hand, hold, then switch',
    ],
  },
  {
    name: 'Glute Bridges',
    description: 'Activate and strengthen the posterior chain',
    duration: 45,
    reps: 15,
    sets: 3,
    type: 'strength',
    isPartner: false,
    emoji: '🌉',
    instructions: [
      'Lie on back, knees bent, feet flat',
      'Drive through heels to lift hips',
      'Squeeze glutes at the top',
      'Lower with control',
      'Keep core braced',
    ],
  },
  {
    name: 'Bicycle Crunches',
    description: 'Oblique-focused core burner',
    duration: 45,
    reps: 20,
    sets: 3,
    type: 'strength',
    isPartner: false,
    emoji: '🚴',
    instructions: [
      'Lie on back, hands behind head',
      'Bring opposite elbow to opposite knee',
      'Extend the other leg',
      'Alternate in a pedaling motion',
      'Don\'t pull on your neck',
    ],
  },
  {
    name: 'Jump Rope Mimic',
    description: 'Invisible jump rope for cardio burst',
    duration: 45,
    type: 'cardio',
    isPartner: false,
    emoji: '⏭️',
    instructions: [
      'Pretend to hold a jump rope',
      'Bounce lightly on balls of feet',
      'Rotate wrists as if turning the rope',
      'Keep jumps small and quick',
      'Stay light and bouncy',
    ],
  },
  {
    name: 'Wall Sit Challenge',
    description: 'Isometric leg endurance — compete with partner',
    duration: 45,
    type: 'strength',
    isPartner: false,
    emoji: '🪑',
    instructions: [
      'Back flat against a wall',
      'Slide down until thighs are parallel to floor',
      'Knees at 90 degrees',
      'Hold position, breathe steadily',
      'See who lasts longer!',
    ],
  },
  {
    name: 'Child\'s Pose to Cobra',
    description: 'Gentle mobility flow for recovery',
    duration: 60,
    type: 'yoga',
    isPartner: false,
    emoji: '🐍',
    instructions: [
      'Start in child\'s pose, arms extended',
      'Slide forward into cobra',
      'Open the chest, look up gently',
      'Push back to child\'s pose',
      'Flow slowly with the breath',
    ],
  },
  {
    name: 'Lateral Shuffles',
    description: 'Side-to-side agility drill',
    duration: 40,
    type: 'cardio',
    isPartner: false,
    emoji: '↔️',
    instructions: [
      'Athletic stance, knees bent',
      'Shuffle 4 steps to the right',
      'Shuffle 4 steps to the left',
      'Stay low, don\'t cross feet',
      'Keep chest up',
    ],
  },
  {
    name: 'Tricep Dips',
    description: 'Home arm strength using a sturdy chair or couch edge',
    duration: 40,
    reps: 12,
    sets: 3,
    type: 'strength',
    isPartner: false,
    emoji: '💺',
    instructions: [
      'Sit on edge of a sturdy home chair or couch',
      'Hands beside hips, fingers forward',
      'Slide off and lower body by bending elbows',
      'Push back up',
      'Keep elbows pointing back — no gym needed',
    ],
  },
  {
    name: 'Standing Forward Fold',
    description: 'Hamstring stretch and calming breath',
    duration: 45,
    type: 'yoga',
    isPartner: false,
    emoji: '🙇',
    instructions: [
      'Stand tall, hinge at hips',
      'Let upper body hang heavy',
      'Bend knees slightly if needed',
      'Hold elbows or let arms dangle',
      'Breathe deeply for the duration',
    ],
  },
  {
    name: 'Shadow Boxing',
    description: 'Throw punches with energy — great stress relief',
    duration: 60,
    type: 'cardio',
    isPartner: false,
    emoji: '🥊',
    instructions: [
      'Athletic stance, fists up',
      'Throw jabs, crosses, hooks',
      'Move feet, stay light',
      'Exhale on each punch',
      'Imagine your stress as the bag!',
    ],
  },
  {
    name: 'Superman Holds',
    description: 'Strengthen the entire back chain — all at home, no equipment',
    duration: 40,
    reps: 12,
    sets: 3,
    type: 'strength',
    isPartner: false,
    emoji: '🦸',
    instructions: [
      'Lie face down on a mat or carpet, arms extended forward',
      'Lift arms, chest, and legs off the ground',
      'Hold briefly at the top',
      'Lower with control',
      'Keep neck neutral',
    ],
  },
  // Home-only posture / height-support moves
  {
    name: 'Standing Overhead Reach',
    description: 'Home stretch to elongate the spine and open the chest',
    duration: 45,
    reps: 10,
    sets: 2,
    type: 'yoga',
    isPartner: false,
    emoji: '🙆',
    instructions: [
      'Stand barefoot on a flat floor',
      'Interlace fingers and turn palms to the ceiling',
      'Reach up tall, lift through the crown of your head',
      'Gently lean side to side',
      'Breathe deeply — feel space between vertebrae',
    ],
  },
  {
    name: 'Calf Raises (Home)',
    description: 'Bodyweight calf raises — great for posture and leg lines at home',
    duration: 45,
    reps: 20,
    sets: 3,
    type: 'strength',
    isPartner: false,
    emoji: '🦶',
    instructions: [
      'Stand near a wall for light balance if needed',
      'Feet hip-width, rise onto the balls of your feet',
      'Pause at the top, lower slowly',
      'Keep knees soft, core tight',
      'Optional: do one leg at a time',
    ],
  },
  {
    name: 'Cat-Cow Spine Flow',
    description: 'Floor mobility flow for spinal flexibility — mat or carpet only',
    duration: 60,
    type: 'yoga',
    isPartner: false,
    emoji: '🐱',
    instructions: [
      'On all fours at home (mat or carpet)',
      'Inhale — drop belly, lift chest (cow)',
      'Exhale — round spine, tuck chin (cat)',
      'Flow slowly with the breath',
      'Keep wrists under shoulders, knees under hips',
    ],
  },
  {
    name: 'Wall Angels',
    description: 'Back-to-wall mobility to improve posture and standing height presence',
    duration: 45,
    reps: 12,
    sets: 2,
    type: 'yoga',
    isPartner: false,
    emoji: '👼',
    instructions: [
      'Stand with back flat against a wall at home',
      'Feet a few inches from the wall, core braced',
      'Arms in a goal-post position against the wall',
      'Slide arms up and down keeping contact',
      'Don\'t arch the lower back off the wall',
    ],
  },
  {
    name: 'Hanging Dead Hang (Doorway)',
    description: 'Gentle decompression using a sturdy home doorway pull-up bar if you have one — or skip to overhead reach',
    duration: 30,
    type: 'strength',
    isPartner: false,
    emoji: '🚪',
    instructions: [
      'Only if you have a secure doorway bar at home',
      'Hang with relaxed shoulders for up to 30s',
      'Breathe calmly; feet can lightly touch the floor',
      'No bar? Do Standing Overhead Reach instead',
      'Never hang from an unsafe door or frame',
    ],
  },
  {
    name: 'Pelvic Tilts & Posture Reset',
    description: 'Floor core drill that supports better standing posture',
    duration: 45,
    reps: 15,
    sets: 2,
    type: 'strength',
    isPartner: false,
    emoji: '📐',
    instructions: [
      'Lie on your back at home, knees bent, feet flat',
      'Flatten lower back into the floor (tilt pelvis)',
      'Release slightly, then tilt again',
      'Keep breathing steady',
      'Helps you stand taller through the day',
    ],
  },
  {
    name: 'Partner Height Stretch',
    description: 'Home duo stretch — one gently assists an overhead reach',
    duration: 50,
    type: 'partner',
    isPartner: true,
    emoji: '📏',
    instructions: [
      'Both stand barefoot at home',
      'Partner A reaches arms overhead',
      'Partner B lightly supports wrists and cues "tall spine"',
      'Hold 20s, switch roles',
      'No forcing — gentle assist only',
    ],
  },
  {
    name: 'Couch Glute Kickbacks',
    description: 'Home glute strength using the floor only',
    duration: 40,
    reps: 12,
    sets: 3,
    type: 'strength',
    isPartner: false,
    emoji: '🛋️',
    instructions: [
      'On all fours on a mat or carpet',
      'Keep core tight, extend one leg straight back and up',
      'Squeeze glute at the top',
      'Lower without touching the knee down fully',
      'Finish the set, then switch legs',
    ],
  },
  {
    name: 'Living Room March',
    description: 'Low-impact home cardio — march in place with high knees',
    duration: 60,
    type: 'cardio',
    isPartner: false,
    emoji: '🏠',
    instructions: [
      'Clear a small space in your living room',
      'March in place, lifting knees to hip height',
      'Swing arms naturally',
      'Stay light on your feet',
      'Perfect zero-equipment cardio',
    ],
  },
];

/** Keywords in custom notes that unlock specialized home exercise sets */
const HEIGHT_KEYWORDS = ['height', 'taller', 'grow', 'posture', 'spine', 'elongat'];

const ROUTINE_TITLES = [
  'Power Couple Session',
  'Together Stronger',
  'Love & Sweat',
  'Dynamic Duo Workout',
  'Heart-Racing Hour',
  'Bond & Burn',
  'Synced Sweat Session',
  'Partner Power Hour',
  'Couple Core Crusher',
  'Unity Fitness Flow',
  'Two Hearts, One Workout',
  'Sweaty Soulmates',
];

const QUOTES = [
  'A couple that sweats together, stays together! 💪💕',
  'Your partner is your best accountability buddy.',
  'Stronger together — one rep at a time.',
  'Love is the best motivation. Let\'s move!',
  'Today\'s effort is tomorrow\'s strength — for both of you.',
  'Teamwork makes the dream work. And the gains too!',
  'Push each other. Lift each other. Love each other.',
  'Fitness is more fun when you share it.',
  'Every workout is a date with a healthier future.',
  'Be each other\'s reason to never give up.',
];

const DURATION_MAP: Record<string, number> = {
  '15min': 15,
  '30min': 30,
  '45min': 45,
  '60min': 60,
};

function filterExercises(
  types: ExerciseType[],
  level: FitnessLevel,
  includePartner: boolean
): Omit<Exercise, 'id'>[] {
  let pool = EXERCISE_POOL.filter((e) => {
    if (types.length > 0 && !types.includes(e.type) && !(includePartner && e.isPartner)) {
      // Always allow some variety
      return Math.random() > 0.5;
    }
    return true;
  });

  if (includePartner) {
    const partners = EXERCISE_POOL.filter((e) => e.isPartner);
    pool = [...pool, ...partners];
  }

  // Adjust duration based on level
  return pool.map((e) => {
    const mult = level === 'beginner' ? 0.8 : level === 'advanced' ? 1.3 : 1;
    return {
      ...e,
      duration: Math.round(e.duration * mult),
      reps: e.reps ? Math.round(e.reps * mult) : undefined,
      sets: e.sets ? (level === 'beginner' ? Math.max(2, (e.sets || 3) - 1) : level === 'advanced' ? (e.sets || 3) + 1 : e.sets) : undefined,
    };
  });
}

const HEIGHT_HOME_NAMES = [
  'Standing Overhead Reach',
  'Calf Raises (Home)',
  'Cat-Cow Spine Flow',
  'Wall Angels',
  'Hanging Dead Hang (Doorway)',
  'Pelvic Tilts & Posture Reset',
  'Partner Height Stretch',
  'Sun Salutation Flow',
  "Child's Pose to Cobra",
  'Standing Forward Fold',
  'Warrior II Hold',
];

function noteWantsHeight(note: string, focusAreas: string[]): boolean {
  const n = (note || '').toLowerCase();
  if (HEIGHT_KEYWORDS.some((k) => n.includes(k))) return true;
  return (focusAreas || []).some((f) => /height|posture/i.test(f));
}

export function generateDailyRoutine(
  user: UserProfile,
  partner: UserProfile | null
): DailyRoutine {
  const targetMin = DURATION_MAP[user.preferredTime] || 30;
  const level = user.level;
  const types =
    user.preferredTypes.length > 0
      ? user.preferredTypes
      : (['cardio', 'strength', 'partner', 'yoga'] as ExerciseType[]);
  const customNote = (user.customNote || '').trim();
  const wantsHeight = noteWantsHeight(customNote, user.focusAreas || []);

  const pool = filterExercises(types, level, true);
  const shuffled = shuffle(pool);

  const exercises: Exercise[] = [];
  let totalSeconds = 0;
  const targetSeconds = targetMin * 60 * 0.85; // account for rest

  // Always start with a home warm-up
  const warmup =
    EXERCISE_POOL.find((e) => e.name === 'Living Room March') ||
    EXERCISE_POOL.find((e) => e.name === 'Jumping Jacks')!;
  exercises.push({ ...warmup, id: uid(), duration: 40 });
  totalSeconds += 40;

  // Prioritize custom "something else" goals (e.g. height) with home exercises
  if (wantsHeight) {
    const heightPool = shuffle(
      EXERCISE_POOL.filter(
        (e) =>
          HEIGHT_HOME_NAMES.includes(e.name) &&
          (!e.isPartner || !!partner)
      )
    ).slice(0, 4);
    for (const he of heightPool) {
      if (totalSeconds >= targetSeconds) break;
      if (exercises.some((e) => e.name === he.name)) continue;
      exercises.push({ ...he, id: uid() });
      totalSeconds += he.duration + 15;
    }
  }

  // Ensure at least 2 partner home exercises if partner exists
  if (partner) {
    const partnerExs = shuffle(EXERCISE_POOL.filter((e) => e.isPartner)).slice(0, 3);
    for (const pe of partnerExs) {
      if (totalSeconds >= targetSeconds) break;
      if (exercises.some((e) => e.name === pe.name)) continue;
      const adj =
        filterExercises([pe.type], level, true).find((e) => e.name === pe.name) || pe;
      exercises.push({ ...adj, id: uid() });
      totalSeconds += adj.duration + 15; // rest
    }
  }

  for (const ex of shuffled) {
    if (totalSeconds >= targetSeconds) break;
    if (exercises.some((e) => e.name === ex.name)) continue;
    exercises.push({ ...ex, id: uid() });
    totalSeconds += ex.duration + 15;
  }

  // Cool down
  const cooldown = EXERCISE_POOL.find((e) => e.name === "Child's Pose to Cobra")!;
  if (!exercises.some((e) => e.name === cooldown.name)) {
    exercises.push({ ...cooldown, id: uid(), duration: 60 });
    totalSeconds += 60;
  }

  const goals = user.goals.map((g) => g.replace('_', ' ')).join(' & ');
  const title = wantsHeight
    ? pick([
        'Home Height & Posture Flow',
        'Stand Taller Together',
        'Spine & Stretch Home Session',
        'Posture Power at Home',
      ])
    : pick(ROUTINE_TITLES);

  const focusBit =
    (user.focusAreas || []).length > 0
      ? ` Focus: ${(user.focusAreas || []).join(', ')}.`
      : '';
  const noteBit = customNote
    ? ` Custom goal: “${customNote}” — plan tailored to that.`
    : '';

  return {
    id: uid(),
    date: todayStr(),
    title,
    description: `Home-only ${targetMin}-min couple routine for ${goals || 'overall fitness'}.${focusBit}${noteBit} Zero gym needed — living room ready${partner ? ' for two' : ''}!`,
    totalDuration: Math.ceil(totalSeconds / 60),
    exercises,
    difficulty: level,
    motivationalQuote: pick(QUOTES),
  };
}

const PUNISHMENT_TEMPLATES: {
  type: PunishmentType;
  title: string;
  description: string;
  emoji: string;
}[] = [
  {
    type: 'plank_challenge',
    title: '3-Minute Plank Challenge',
    description: 'Hold a plank for 3 full minutes. Your partner times you. No mercy!',
    emoji: '🪵',
  },
  {
    type: 'burpee_blast',
    title: '50 Burpee Blast',
    description: 'Complete 50 burpees while your partner watches. Rest only as needed.',
    emoji: '💥',
  },
  {
    type: 'cold_shower',
    title: 'Ice Cold Shower',
    description: 'Take a full cold shower (minimum 2 minutes). Screenshot the steam-free glass as proof!',
    emoji: '🧊',
  },
  {
    type: 'partner_choice',
    title: 'Partner\'s Choice Dare',
    description: 'Your partner gets to pick any fun (but safe!) fitness dare for you to complete today.',
    emoji: '🎯',
  },
  {
    type: 'extra_cardio',
    title: 'Extra 20-Min Cardio',
    description: 'Add 20 minutes of continuous cardio — run, bike, jump rope, or dance. No shortcuts!',
    emoji: '🏃',
  },
  {
    type: 'dance_dare',
    title: 'Public Dance Dare',
    description: 'Perform a 60-second freestyle dance for your partner. Full commitment required!',
    emoji: '🕺',
  },
  {
    type: 'compliment_marathon',
    title: 'Compliment Marathon',
    description: 'Give your partner 20 genuine compliments throughout the day. They keep count!',
    emoji: '🥰',
  },
  {
    type: 'chore_swap',
    title: 'Chore Takeover',
    description: 'Do all of your partner\'s chores for the day. Fitness of character counts too!',
    emoji: '🧹',
  },
];

export function generatePunishment(userId: string): Punishment {
  const template = pick(PUNISHMENT_TEMPLATES);
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 1);

  return {
    id: uid(),
    type: template.type,
    title: template.title,
    description: template.description,
    emoji: template.emoji,
    assignedTo: userId,
    assignedBy: 'system',
    createdAt: now.toISOString(),
    dueDate: due.toISOString().slice(0, 10),
    completed: false,
  };
}

export function generateCoupleCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createId(): string {
  return uid();
}

export { todayStr };
