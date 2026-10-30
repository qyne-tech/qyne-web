/**
 * The article catalogue.
 *
 * The articles themselves live in qyne-service (`GET /articles`), the same
 * table the app reads, so a reading list in the app and a page on the site can
 * never disagree about what exists. Slugs are the contract between the repos:
 * renaming one breaks a link in a shipped build, so treat them as permanent.
 *
 * What stays here is the list of categories, because the site's URLs are built
 * from them (`/articles?category=heart-rate`) and the app deep-links on those.
 * To add a metric, add one entry to `CATEGORIES` with the service's key.
 * Reading them is `lib/articles-api.ts`.
 */
/** A metric surface in the app. Articles hang off these, and so does the sidebar. */
export interface Category {
  /** The site's slug, used in `?category=`. Permanent: the app links on it. */
  slug: string;
  /** The service's metric key, sent as `GET /articles?metric=`. */
  metric: string;
  label: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: 'heart-rate',
    metric: 'heart_rate',
    label: 'Heart rate',
    blurb: 'What your beats per minute do and do not tell you.',
  },
  {
    slug: 'resting-heart-rate',
    metric: 'resting_heart_rate',
    label: 'Resting heart rate',
    blurb: 'The number that moves slowly, and why that matters.',
  },
  {
    slug: 'hrv',
    metric: 'hrv',
    label: 'HRV',
    blurb: 'Variability between beats, and the two statistics behind it.',
  },
  {
    slug: 'vo2-max',
    metric: 'vo2_max',
    label: 'VO2 max',
    blurb: 'Aerobic capacity, how it is estimated, and how to raise it.',
  },
  {
    slug: 'strain',
    metric: 'strain',
    label: 'Strain',
    blurb: 'Training load as it accumulates through a day.',
  },
  {
    slug: 'stress',
    metric: 'stress',
    label: 'Stress',
    blurb: 'What a physiological stress score is measuring.',
  },
  {
    slug: 'sleep',
    metric: 'sleep',
    label: 'Sleep',
    blurb: 'Stages, debt, efficiency, and what actually helps.',
  },
  {
    slug: 'spo2',
    metric: 'spo2',
    label: 'Blood oxygen',
    blurb: 'Saturation overnight and what a dip means.',
  },
  {
    slug: 'temperature',
    metric: 'skin_temperature',
    label: 'Temperature',
    blurb: 'Skin and wrist temperature as a trend, not a thermometer.',
  },
  {
    slug: 'calories',
    metric: 'calories',
    label: 'Calories',
    blurb: 'Active versus total energy, and why they differ threefold.',
  },
  {
    slug: 'steps',
    metric: 'steps',
    label: 'Steps',
    blurb: 'Daily movement, and the evidence behind the targets.',
  },
  {
    slug: 'workouts',
    metric: 'workouts',
    label: 'Workouts',
    blurb: 'Sessions, intensity and what to record.',
  },
  {
    slug: 'recovery',
    metric: 'recovery',
    label: 'Recovery',
    blurb: 'Readiness, energy and deciding whether to push today.',
  },
];

/** One entry in a reading list, as `GET /articles` returns it plus its site category. */
export interface Article {
  /** Stable. The app deep-links on this, so a rename breaks a shipped build. */
  slug: string;
  title: string;
  /** Category slug, derived from the service's `metric`. */
  category: string;
  /** Who wrote the authoritative version. */
  source: string;
  readMinutes: number;
  /** The publisher's page when the authoritative version lives there. */
  url: string | null;
}

/** One article, as opened. `body` is `null` until it is written. */
export interface ArticleDetail extends Article {
  body: string | null;
}

/** The category with this site slug, or undefined. */
export function categoryBySlug(slug: string | null | undefined): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** The category an article belongs to. */
export function categoryOf(article: Article): Category | undefined {
  return categoryBySlug(article.category);
}
