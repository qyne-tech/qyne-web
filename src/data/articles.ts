/**
 * The article catalogue.
 *
 * Every entry here is a title the app already shows somewhere, so a reading
 * list in the app and a page on the site can never disagree about what exists.
 * Slugs are the contract between the two repos: renaming one breaks a link in
 * a shipped build, so treat them as permanent.
 *
 * **Nothing is written yet.** Each page says so. We deliberately do not ship
 * invented health prose under a real-looking title, per ADR-0006: a placeholder
 * that announces itself is honest, and one that reads like an article is not.
 * `ART-3-*` fills these in one metric at a time.
 */

/** A metric surface in the app. Articles hang off these, and so does the sidebar. */
export interface Category {
  slug: string;
  label: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: 'heart-rate',
    label: 'Heart rate',
    blurb: 'What your beats per minute do and do not tell you.',
  },
  {
    slug: 'resting-heart-rate',
    label: 'Resting heart rate',
    blurb: 'The number that moves slowly, and why that matters.',
  },
  {
    slug: 'hrv',
    label: 'HRV',
    blurb: 'Variability between beats, and the two statistics behind it.',
  },
  {
    slug: 'vo2-max',
    label: 'VO2 max',
    blurb: 'Aerobic capacity, how it is estimated, and how to raise it.',
  },
  { slug: 'strain', label: 'Strain', blurb: 'Training load as it accumulates through a day.' },
  { slug: 'stress', label: 'Stress', blurb: 'What a physiological stress score is measuring.' },
  { slug: 'sleep', label: 'Sleep', blurb: 'Stages, debt, efficiency, and what actually helps.' },
  { slug: 'spo2', label: 'Blood oxygen', blurb: 'Saturation overnight and what a dip means.' },
  {
    slug: 'temperature',
    label: 'Temperature',
    blurb: 'Skin and wrist temperature as a trend, not a thermometer.',
  },
  {
    slug: 'calories',
    label: 'Calories',
    blurb: 'Active versus total energy, and why they differ threefold.',
  },
  { slug: 'steps', label: 'Steps', blurb: 'Daily movement, and the evidence behind the targets.' },
  { slug: 'workouts', label: 'Workouts', blurb: 'Sessions, intensity and what to record.' },
  {
    slug: 'recovery',
    label: 'Recovery',
    blurb: 'Readiness, energy and deciding whether to push today.',
  },
];

export interface Article {
  /** Stable. The app deep-links on this, so a rename breaks a shipped build. */
  slug: string;
  title: string;
  /** Category slug. */
  category: string;
}

/** `[slug, title]` pairs per category, kept terse so the list stays readable. */
const BY_CATEGORY: Record<string, Array<[string, string]>> = {
  'heart-rate': [
    ['watch-your-heart-rate-but-dont-obsess', "Watch your heart rate, but don't obsess about it"],
    ['target-heart-rate-zones', 'Target heart rate zones, and what each one trains'],
    ['exercise-intensity-how-to-measure-it', 'Exercise intensity: how to measure it'],
  ],
  'resting-heart-rate': [
    ['what-resting-heart-rate-says', 'What your resting heart rate is actually telling you'],
    [
      'reported-versus-derived-resting-hr',
      'Reported, sleeping or derived: three ways to get a resting heart rate',
    ],
  ],
  hrv: [
    ['hrv-sdnn-versus-rmssd', 'SDNN and RMSSD are both called HRV, and they are not the same'],
    ['reading-your-own-hrv-baseline', 'Reading your own HRV baseline'],
  ],
  'vo2-max': [
    ['vo2-max-what-it-is', 'VO2 max: what is it and how can you improve it?'],
    ['increasing-vo2-max', 'How increasing your VO2 max improves fitness and health'],
    ['vo2-max-and-frailty', 'Improving VO2 max to help prevent frailty, boost heart health'],
    ['why-our-vo2-max-is-an-estimate', 'Why the VO2 max in your app is an estimate'],
  ],
  strain: [
    ['what-training-load-measures', 'What training load is measuring'],
    ['hard-days-easy-days', 'Hard days hard, easy days easy'],
  ],
  stress: [
    ['what-a-stress-score-measures', 'What a wearable stress score is measuring'],
    ['stress-and-recovery', 'Stress, recovery and the autonomic nervous system'],
  ],
  sleep: [
    ['sleep-stages-explained', 'Deep, light and REM: what the stages are for'],
    [
      'understanding-your-sleep-stages-and-recovery',
      'Understanding your sleep stages and recovery',
    ],
    ['how-to-improve-sleep-consistency', 'How to improve your sleep consistency'],
    ['sleep-debt-and-efficiency', 'Sleep debt and sleep efficiency'],
    ['how-much-sleep-do-adults-need', 'How much sleep do adults actually need?'],
  ],
  spo2: [
    ['blood-oxygen-overnight', 'Blood oxygen overnight, and what a dip means'],
    ['wrist-spo2-accuracy', 'How accurate is a wrist blood-oxygen sensor?'],
  ],
  temperature: [
    ['skin-temperature-as-a-trend', 'Skin temperature is a trend, not a thermometer'],
    ['temperature-and-illness-onset', 'Temperature, illness onset and the day before you feel it'],
  ],
  calories: [
    ['how-much-physical-activity-do-adults-need', 'How much physical activity do adults need?'],
    ['calorie-calculator', 'Estimating the calories you need'],
    [
      'calories-burned-in-30-minutes',
      'Calories burned in 30 minutes, at three different body weights',
    ],
    ['active-versus-total-energy', 'Active calories and total calories differ by about threefold'],
  ],
  steps: [
    ['daily-steps-and-health-outcomes', 'Daily steps and health outcomes in adults'],
    ['objectively-measured-daily-steps', 'Objectively measured daily steps and health outcomes'],
    ['you-dont-need-10000-steps', "You don't need 10,000 steps to help your heart"],
  ],
  workouts: [
    ['what-to-record-in-a-session', 'What is worth recording in a session'],
    ['strength-work-and-wearables', 'Why wearables under-read strength work'],
  ],
  recovery: [
    ['what-readiness-is-made-of', 'What a readiness score is made of'],
    ['when-to-push-and-when-not-to', 'When to push, and when not to'],
  ],
};

export const ARTICLES: Article[] = Object.entries(BY_CATEGORY).flatMap(([category, rows]) =>
  rows.map(([slug, title]) => ({ slug, title, category })),
);

/** Articles in a category, in catalogue order. */
export function articlesIn(categorySlug: string): Article[] {
  return ARTICLES.filter((a) => a.category === categorySlug);
}

/** One article by slug, or undefined. */
export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** The category an article belongs to. */
export function categoryOf(article: Article): Category | undefined {
  return CATEGORIES.find((c) => c.slug === article.category);
}
