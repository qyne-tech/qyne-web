/**
 * The article catalogue.
 *
 * PLACEHOLDER CONTENT. Every body below is written to show the shape of a
 * finished article, not to be read as advice. Each entry links to the
 * reputable source it stands in for, so a reader is never stuck with our
 * placeholder when the real thing is one click away.
 *
 * This file exists so the native app and the web site can agree on one list
 * while the real content is written. It is deliberately a flat, typed array
 * rather than a CMS: the server-side content model is `ART-1`, and when that
 * lands this becomes its seed rather than its competitor.
 *
 * FORMULA NEEDED is the wrong marker here; the tracking id is ART-3, the
 * writing ticket, one per metric surface.
 */

/** A metric surface in the app. Articles hang off these, and so does the sidebar. */
export interface Category {
  /** Stable slug, used in the URL and by the native app's deep links. */
  slug: string;
  /** What the athlete sees. Matches the card title in the app. */
  label: string;
  /** One line, shown under the category heading. */
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
  slug: string;
  title: string;
  /** Category slug. */
  category: string;
  readTime: string;
  /** Where the real, authoritative version lives. */
  source: string;
  sourceUrl: string;
  /** One or two sentences, shown on the card. */
  excerpt: string;
  /** Placeholder body. Paragraphs, rendered in order. */
  body: string[];
}

/** Stand-in copy, so a reader is never left looking at an empty page. */
const placeholder = (topic: string, source: string): string[] => [
  `This article is a placeholder. The finished version will explain ${topic} in plain language, with the measurement QYNE actually takes and what it can and cannot tell you.`,
  `Until then, ${source} covers the same ground properly, and the link at the top of this page goes straight there. We would rather send you somewhere accurate than keep you here.`,
  `When the real article lands it will say which of your sources produced the figure, because a number from a band and the same number from a phone are not always the same measurement. That distinction is the thing most guides skip, and it is the one that changes how you should read your own trend.`,
];

export const ARTICLES: Article[] = [
  // ---- Heart rate -----------------------------------------------------------
  {
    slug: 'watch-your-heart-rate-but-dont-obsess',
    title: "Watch your heart rate, but don't obsess about it",
    category: 'heart-rate',
    readTime: '5 min read',
    source: 'American Heart Association',
    sourceUrl:
      'https://www.heart.org/en/news/2021/02/10/watch-your-heart-rate-but-dont-obsess-about-it',
    excerpt:
      'A resting pulse is a useful signal and a poor obsession. What is worth watching, and what is noise.',
    body: placeholder(
      'what a heart rate reading is worth day to day',
      'the American Heart Association',
    ),
  },
  {
    slug: 'target-heart-rate-zones',
    title: 'Target heart rate zones, and what each one trains',
    category: 'heart-rate',
    readTime: '7 min read',
    source: 'American Heart Association',
    sourceUrl: 'https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates',
    excerpt:
      'Five zones, one maximum, and why an age-predicted maximum carries about ten beats of error.',
    body: placeholder(
      'heart-rate zones and the maximum they are derived from',
      'the American Heart Association',
    ),
  },
  {
    slug: 'exercise-intensity-how-to-measure-it',
    title: 'Exercise intensity: how to measure it',
    category: 'heart-rate',
    readTime: '15 min read',
    source: 'Mayo Clinic',
    sourceUrl:
      'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise-intensity/art-20046887',
    excerpt:
      'Perceived effort, the talk test and heart rate, and when each is the better instrument.',
    body: placeholder('how to judge intensity with and without a wearable', 'the Mayo Clinic'),
  },

  // ---- Resting heart rate ---------------------------------------------------
  {
    slug: 'what-resting-heart-rate-says',
    title: 'What your resting heart rate is actually telling you',
    category: 'resting-heart-rate',
    readTime: '6 min read',
    source: 'Harvard Health',
    sourceUrl: 'https://www.health.harvard.edu/heart-health/what-your-heart-rate-is-telling-you',
    excerpt: 'A slow-moving number, which is exactly why a few beats of drift is worth noticing.',
    body: placeholder('resting heart rate as a trend rather than a reading', 'Harvard Health'),
  },
  {
    slug: 'reported-versus-derived-resting-hr',
    title: 'Reported, sleeping or derived: three ways to get a resting heart rate',
    category: 'resting-heart-rate',
    readTime: '5 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/reported-versus-derived-resting-hr',
    excerpt:
      'Your watch computes one. Your band does not, so we derive one. They are not the same number.',
    body: placeholder(
      'why the same card can be fed by three different methods',
      'our own formulas reference',
    ),
  },

  // ---- HRV ------------------------------------------------------------------
  {
    slug: 'hrv-sdnn-versus-rmssd',
    title: 'SDNN and RMSSD are both called HRV, and they are not the same',
    category: 'hrv',
    readTime: '8 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/hrv-sdnn-versus-rmssd',
    excerpt:
      'Two statistics over the same heartbeats, differing by roughly a third. Changing phone can look like a change in you.',
    body: placeholder(
      'the two HRV statistics and why we never pool them',
      'our own formulas reference',
    ),
  },
  {
    slug: 'reading-your-own-hrv-baseline',
    title: 'Reading your own HRV baseline',
    category: 'hrv',
    readTime: '6 min read',
    source: 'Cleveland Clinic',
    sourceUrl: 'https://health.clevelandclinic.org/heart-rate-variability-hrv',
    excerpt:
      'HRV is only meaningful against your own history. What a week of it is worth, and what a single night is not.',
    body: placeholder(
      'why HRV is compared against yourself and nobody else',
      'the Cleveland Clinic',
    ),
  },

  // ---- VO2 max --------------------------------------------------------------
  {
    slug: 'vo2-max-what-it-is',
    title: 'VO2 max: what is it and how can you improve it?',
    category: 'vo2-max',
    readTime: '7 min read',
    source: 'Harvard Health',
    sourceUrl:
      'https://www.health.harvard.edu/healthy-aging-and-longevity/vo2-max-what-is-it-and-how-can-you-improve-it',
    excerpt: 'The ceiling on your aerobic engine, and the training that raises it.',
    body: placeholder('aerobic capacity and the training that changes it', 'Harvard Health'),
  },
  {
    slug: 'increasing-vo2-max',
    title: 'How increasing your VO2 max improves fitness and health',
    category: 'vo2-max',
    readTime: '9 min read',
    source: 'Cleveland Clinic',
    sourceUrl: 'https://health.clevelandclinic.org/what-is-vo2-max-and-how-to-calculate-it',
    excerpt:
      'Why it is one of the better single predictors of long-term health, and how it is measured properly.',
    body: placeholder('VO2 max as a health marker, not just a fitness one', 'the Cleveland Clinic'),
  },
  {
    slug: 'vo2-max-and-frailty',
    title: 'Improving VO2 max to help prevent frailty and boost heart health',
    category: 'vo2-max',
    readTime: '10 min read',
    source: 'AARP',
    sourceUrl: 'https://www.aarp.org/health/healthy-living/how-older-adults-can-improve-vo2-max/',
    excerpt: 'What the number means as you age, and the training that holds it up.',
    body: placeholder('maintaining aerobic capacity over decades', 'AARP'),
  },
  {
    slug: 'why-our-vo2-max-is-an-estimate',
    title: 'Why the VO2 max in your app is an estimate',
    category: 'vo2-max',
    readTime: '4 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/why-our-vo2-max-is-an-estimate',
    excerpt:
      'Derived from the ratio of your maximum to your resting heart rate, carrying roughly 8% error. A trend for you, not a figure to compare with anyone else.',
    body: placeholder(
      'how we estimate VO2 max and what that costs in accuracy',
      'our own formulas reference',
    ),
  },

  // ---- Strain ---------------------------------------------------------------
  {
    slug: 'what-training-load-measures',
    title: 'What training load is measuring',
    category: 'strain',
    readTime: '7 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/what-training-load-measures',
    excerpt:
      'Time spent at intensity, accumulated across a day. Why it is 3 at ten in the morning and 12 by evening.',
    body: placeholder(
      'training load as something that accumulates rather than a reading',
      'our own formulas reference',
    ),
  },
  {
    slug: 'hard-days-easy-days',
    title: 'Hard days hard, easy days easy',
    category: 'strain',
    readTime: '6 min read',
    source: 'Mayo Clinic',
    sourceUrl:
      'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise-intensity/art-20046887',
    excerpt:
      'Most people train the middle. The evidence for spending more time at the two ends instead.',
    body: placeholder('intensity distribution across a training week', 'the Mayo Clinic'),
  },

  // ---- Stress ---------------------------------------------------------------
  {
    slug: 'what-a-stress-score-measures',
    title: 'What a wearable stress score is measuring',
    category: 'stress',
    readTime: '5 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/what-a-stress-score-measures',
    excerpt:
      'It is derived from heart rate variability against your own baseline. It is not a measure of how you feel.',
    body: placeholder(
      'the gap between a physiological stress score and felt stress',
      'our own formulas reference',
    ),
  },
  {
    slug: 'stress-and-recovery',
    title: 'Stress, recovery and the autonomic nervous system',
    category: 'stress',
    readTime: '8 min read',
    source: 'Harvard Health',
    sourceUrl: 'https://www.health.harvard.edu/staying-healthy/understanding-the-stress-response',
    excerpt:
      'The physiology under the number, and why recovery is not simply the absence of training.',
    body: placeholder('the stress response and what recovery actually involves', 'Harvard Health'),
  },

  // ---- Sleep ----------------------------------------------------------------
  {
    slug: 'sleep-stages-explained',
    title: 'Deep, light and REM: what the stages are for',
    category: 'sleep',
    readTime: '7 min read',
    source: 'Sleep Foundation',
    sourceUrl: 'https://www.sleepfoundation.org/stages-of-sleep',
    excerpt: 'What each stage does, and how much a wearable can really tell them apart.',
    body: placeholder('sleep architecture and how wearables estimate it', 'the Sleep Foundation'),
  },
  {
    slug: 'sleep-debt-and-efficiency',
    title: 'Sleep debt and sleep efficiency',
    category: 'sleep',
    readTime: '5 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/sleep-debt-and-efficiency',
    excerpt:
      'Time asleep over time in bed, and the difference between a short night and a broken one.',
    body: placeholder('efficiency, debt, and which one to act on', 'our own formulas reference'),
  },
  {
    slug: 'how-much-sleep-do-adults-need',
    title: 'How much sleep do adults actually need?',
    category: 'sleep',
    readTime: '4 min read',
    source: 'CDC',
    sourceUrl: 'https://www.cdc.gov/sleep/about/index.html',
    excerpt:
      'The guideline, the range around it, and why a fixed target suits almost nobody exactly.',
    body: placeholder('sleep duration guidance and individual variation', 'the CDC'),
  },

  // ---- SpO2 -----------------------------------------------------------------
  {
    slug: 'blood-oxygen-overnight',
    title: 'Blood oxygen overnight, and what a dip means',
    category: 'spo2',
    readTime: '6 min read',
    source: 'Cleveland Clinic',
    sourceUrl: 'https://my.clevelandclinic.org/health/diagnostics/22447-blood-oxygen-level',
    excerpt:
      'What saturation is, the range that is normal, and when a consumer reading is worth a conversation with a doctor.',
    body: placeholder('oxygen saturation and the limits of a wrist sensor', 'the Cleveland Clinic'),
  },
  {
    slug: 'wrist-spo2-accuracy',
    title: 'How accurate is a wrist blood-oxygen sensor?',
    category: 'spo2',
    readTime: '5 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/wrist-spo2-accuracy',
    excerpt:
      'Skin tone, fit, motion and cold hands all move the reading. What that means for reading your own trend.',
    body: placeholder(
      'the practical accuracy of optical SpO2 on the wrist',
      'our own formulas reference',
    ),
  },

  // ---- Temperature ----------------------------------------------------------
  {
    slug: 'skin-temperature-as-a-trend',
    title: 'Skin temperature is a trend, not a thermometer',
    category: 'temperature',
    readTime: '5 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/skin-temperature-as-a-trend',
    excerpt:
      'Your wrist is not your core. What a degree of drift from your own baseline is worth, and what it is not.',
    body: placeholder(
      'wrist temperature deviation and how to read it',
      'our own formulas reference',
    ),
  },
  {
    slug: 'temperature-and-illness-onset',
    title: 'Temperature, illness onset and the day before you feel it',
    category: 'temperature',
    readTime: '6 min read',
    source: 'Harvard Health',
    sourceUrl: 'https://www.health.harvard.edu/staying-healthy/what-is-a-normal-body-temperature',
    excerpt:
      'Why a small sustained rise sometimes precedes symptoms, and why most rises are nothing.',
    body: placeholder('temperature deviation as an early signal', 'Harvard Health'),
  },

  // ---- Calories -------------------------------------------------------------
  {
    slug: 'how-much-physical-activity-do-adults-need',
    title: 'How much physical activity do adults need?',
    category: 'calories',
    readTime: '3 min read',
    source: 'CDC',
    sourceUrl: 'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html',
    excerpt:
      'The weekly guideline, in minutes rather than calories, and why that framing is easier to act on.',
    body: placeholder('activity guidelines and how to meet them', 'the CDC'),
  },
  {
    slug: 'calorie-calculator',
    title: 'Estimating the calories you need',
    category: 'calories',
    readTime: '2 min read',
    source: 'Mayo Clinic',
    sourceUrl:
      'https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/calorie-calculator/itt-20402304',
    excerpt: 'How a daily energy estimate is built from height, weight, age and activity.',
    body: placeholder('how daily energy requirements are estimated', 'the Mayo Clinic'),
  },
  {
    slug: 'calories-burned-in-30-minutes',
    title: 'Calories burned in 30 minutes, at three different body weights',
    category: 'calories',
    readTime: '4 min read',
    source: 'Harvard Health',
    sourceUrl:
      'https://www.health.harvard.edu/diet-and-weight-loss/calories-burned-in-30-minutes-for-people-of-three-different-weights',
    excerpt:
      'A reference table, and a reminder that body mass moves these numbers more than most people expect.',
    body: placeholder('energy cost of common activities', 'Harvard Health'),
  },
  {
    slug: 'active-versus-total-energy',
    title: 'Active calories and total calories differ by about threefold',
    category: 'calories',
    readTime: '5 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/active-versus-total-energy',
    excerpt:
      'One counts movement. The other adds everything your body spends staying alive. Sources disagree about which they publish.',
    body: placeholder(
      'the difference between active and total energy, and why your band only reports one',
      'our own formulas reference',
    ),
  },

  // ---- Steps ----------------------------------------------------------------
  {
    slug: 'daily-steps-and-health-outcomes',
    title: 'Daily steps and health outcomes in adults',
    category: 'steps',
    readTime: '5 min read',
    source: 'The Lancet',
    sourceUrl:
      'https://www.thelancet.com/journals/lanpub/article/PIIS2468-2667(21)00302-9/fulltext',
    excerpt:
      'A meta-analysis across fifteen cohorts. More steps helps, and the benefit flattens well before ten thousand.',
    body: placeholder('the dose-response between daily steps and mortality', 'The Lancet'),
  },
  {
    slug: 'you-dont-need-10000-steps',
    title: "You don't need 10,000 steps to help your heart",
    category: 'steps',
    readTime: '15 min read',
    source: 'Harvard Health',
    sourceUrl: 'https://www.health.harvard.edu/staying-healthy/10000-steps-a-day-or-fewer',
    excerpt: 'Where the ten-thousand figure came from, and what the evidence actually supports.',
    body: placeholder(
      'the origin of the 10,000-step target and the evidence behind it',
      'Harvard Health',
    ),
  },

  // ---- Workouts -------------------------------------------------------------
  {
    slug: 'what-to-record-in-a-session',
    title: 'What is worth recording in a session',
    category: 'workouts',
    readTime: '5 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/what-to-record-in-a-session',
    excerpt:
      'Duration and intensity carry most of the signal. What the rest adds, and when it is noise.',
    body: placeholder(
      'which session fields are worth the friction of recording',
      'our own formulas reference',
    ),
  },
  {
    slug: 'strength-work-and-wearables',
    title: 'Why wearables under-read strength work',
    category: 'workouts',
    readTime: '6 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/strength-work-and-wearables',
    excerpt:
      'No steps, modest heart rate, real fatigue. What gets missed when load is inferred from movement.',
    body: placeholder(
      'why resistance training is poorly captured by step-derived models',
      'our own formulas reference',
    ),
  },

  // ---- Recovery -------------------------------------------------------------
  {
    slug: 'what-readiness-is-made-of',
    title: 'What a readiness score is made of',
    category: 'recovery',
    readTime: '6 min read',
    source: 'QYNE',
    sourceUrl: 'https://qyne.in/articles/what-readiness-is-made-of',
    excerpt:
      'Sleep, HRV and resting heart rate, each against your own baseline. The weights, and why they are a v1.',
    body: placeholder(
      'the components of a readiness score and their weights',
      'our own formulas reference',
    ),
  },
  {
    slug: 'when-to-push-and-when-not-to',
    title: 'When to push, and when not to',
    category: 'recovery',
    readTime: '7 min read',
    source: 'Cleveland Clinic',
    sourceUrl: 'https://health.clevelandclinic.org/signs-of-overtraining',
    excerpt:
      'Reading a low score against how you actually feel, and the signs that matter more than any number.',
    body: placeholder(
      'overreaching, overtraining and the signals worth acting on',
      'the Cleveland Clinic',
    ),
  },
];

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
