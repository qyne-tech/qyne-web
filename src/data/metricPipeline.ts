/**
 * Where the numbers come from: what each source hands us untouched, what we
 * compute ourselves, and what happens to a reading between the two.
 *
 * Kept apart from metricDocs.ts because it answers a different question. That
 * file documents a figure an athlete can see; this one documents provenance,
 * which is the question behind "why does my watch say something else".
 *
 * Every row is transcribed from the code that does the thing: the canonical
 * metric list and its bounds from the service, and the per-source columns from
 * what the app actually uploads, which is not the same as what a platform
 * holds. Health Connect has a respiratory-rate record and we have never asked
 * for it; a table built from platform capabilities would say we had it.
 */

import type { SourceKey } from './metricDocs';

/** Whether a source sends a given reading today, and under what name. */
export type Sends = boolean;

/**
 * A measurement that arrives as-is and is stored as-is.
 *
 * `wire` is the canonical metric name it is stored under, which is worth
 * printing: two of them exist only because one name meant two things and
 * nothing errored.
 */
export interface RawInput {
  wire: string;
  label: string;
  unit: string;
  /** Values outside this are rejected at ingest rather than stored. */
  accepted: string;
  /** How several readings for one day become one figure. */
  rollup: string;
  note: string;
  sources: Record<SourceKey, Sends>;
}

export const RAW_INPUTS: RawInput[] = [
  {
    wire: 'heart_rate',
    label: 'Continuous heart rate',
    unit: 'bpm',
    accepted: '20-250',
    rollup: 'kept per sample',
    note: 'The band streams it; the phones send a per-minute series under heart_rate_raw, which lands in the same canonical series. Everything downstream reads it without knowing which arrived: resting-HR derivation, zones and TRIMP.',
    sources: { band: true, health_connect: true, apple_health: true },
  },
  {
    wire: 'resting_heart_rate',
    label: 'The source’s own resting figure',
    unit: 'bpm',
    accepted: '20-150',
    rollup: 'median of the day’s reported values',
    note: 'HealthKit and Health Connect both publish a resting figure they derive themselves. A band instead streams raw beats all day, so for the band this is derived rather than received. Never pooled with the raw stream: an already-resting 55 beside a mid-workout 160 made every consumer average two different things.',
    sources: { band: false, health_connect: true, apple_health: true },
  },
  {
    wire: 'hrv_sdnn',
    label: 'HRV, as SDNN',
    unit: 'ms',
    accepted: '0-500 (1-255 from the band)',
    rollup: 'mean over the night',
    note: 'The band’s vendor constants name SDNN, and HealthKit exposes only SDNN.',
    sources: { band: true, health_connect: false, apple_health: true },
  },
  {
    wire: 'hrv_rmssd',
    label: 'HRV, as RMSSD',
    unit: 'ms',
    accepted: '0-500',
    rollup: 'mean over the night',
    note: 'Health Connect exposes only RMSSD. A different statistic over the same beats, with a different magnitude and no conversion into SDNN, so it is a separate series and the two are never compared. A provider that will not say which statistic it sends is refused at ingest.',
    sources: { band: false, health_connect: true, apple_health: false },
  },
  {
    wire: 'spo2',
    label: 'Blood oxygen',
    unit: '%',
    accepted: '50-100',
    rollup: 'mean over the night',
    note: 'Spot measurements on the band; whatever the platform holds on the phones.',
    sources: { band: true, health_connect: true, apple_health: true },
  },
  {
    wire: 'skin_temperature',
    label: 'Skin temperature',
    unit: '°C',
    accepted: '20-45',
    rollup: 'mean over the night',
    note: 'On iOS this is assembled from whichever record the athlete’s devices write: Apple’s sleeping wrist temperature, a third-party body temperature, or a basal reading.',
    sources: { band: true, health_connect: true, apple_health: true },
  },
  {
    wire: 'respiratory_rate',
    label: 'Breaths a minute',
    unit: 'brpm',
    accepted: '4-60',
    rollup: 'mean over the night',
    note: 'Accepted and stored, and nothing sends it. HealthKit publishes a respiratory rate and Health Connect has the record; neither has been asked for. The band reports a breath figure only alongside an ECG spot measurement, so it arrives when the athlete takes one rather than overnight.',
    sources: { band: false, health_connect: false, apple_health: false },
  },
  {
    wire: 'sleep_stage',
    label: 'Staged sleep sessions',
    unit: 'stage spans',
    accepted: 'spans within one session',
    rollup: 'summed per stage per night',
    note: 'Posted to its own endpoint rather than as readings, because a night is a session with stages inside it and not a point measurement. Awake, light, deep and REM where the source distinguishes them.',
    sources: { band: true, health_connect: true, apple_health: true },
  },
  {
    wire: 'steps',
    label: 'Steps, running day total',
    unit: 'count',
    accepted: '0-200,000',
    rollup: 'max()',
    note: 'Cumulative, so the rollup is a maximum and summing it would multiply-count every sync.',
    sources: { band: true, health_connect: true, apple_health: true },
  },
  {
    wire: 'steps_delta',
    label: 'Steps within one interval',
    unit: 'count',
    accepted: '0-1,000',
    rollup: 'sum()',
    note: 'The band reports both: a running total on one opcode and per-minute detail on another. They cannot share a metric: max() over a day of intervals returns the busiest minute, and sum() over a mixed series adds a whole day to one bucket.',
    sources: { band: true, health_connect: false, apple_health: false },
  },
  {
    wire: 'active_energy',
    label: 'Active calories, day total',
    unit: 'kcal',
    accepted: '0-20,000',
    rollup: 'max()',
    note: 'The band computes this on-wrist at about 0.033 kcal per step, with no basal component at all.',
    sources: { band: true, health_connect: true, apple_health: true },
  },
  {
    wire: 'active_energy_delta',
    label: 'Active calories in one block',
    unit: 'kcal',
    accepted: 'per 10-minute block',
    rollup: 'sum()',
    note: 'The same split as steps against steps_delta, for calories.',
    sources: { band: true, health_connect: false, apple_health: false },
  },
  {
    wire: 'total_energy',
    label: 'Total calories, day total',
    unit: 'kcal',
    accepted: '0-30,000',
    rollup: 'max()',
    note: 'Active plus basal, and never pooled with active energy: a resting adult burns 1,500-2,000 kcal doing nothing, so filing a total as an active figure roughly triples it. Plenty of Android writers populate only this one, which is why one athlete’s calories card read 0 for ninety-one consecutive days.',
    sources: { band: false, health_connect: true, apple_health: true },
  },
  {
    wire: 'active_minutes',
    label: 'Active or exercise minutes',
    unit: 'minutes',
    accepted: '0-1,440',
    rollup: 'max()',
    note: 'A per-day total as each source defines it. The definitions differ between sources and we do not reconcile them.',
    sources: { band: true, health_connect: true, apple_health: true },
  },
  {
    wire: 'distance',
    label: 'Walking and running distance',
    unit: 'km',
    accepted: '0-1,000',
    rollup: 'max()',
    note: 'A per-day total. Converted to kilometres at ingest if the sample declares another unit.',
    sources: { band: true, health_connect: true, apple_health: true },
  },
  {
    wire: 'workout',
    label: 'Workout sessions',
    unit: 'session',
    accepted: 'start, duration, sport',
    rollup: 'one row per session',
    note: 'Each source names a sport its own way, and the band calls a run 0, so every session is mapped onto a shared sport vocabulary and keeps its original label for display.',
    sources: { band: true, health_connect: true, apple_health: true },
  },
  {
    wire: 'battery_level',
    label: 'Band battery',
    unit: '%',
    accepted: '0-100',
    rollup: 'latest',
    note: 'Not a health figure. Listed because it is received, and because a flat band is the most common reason a chart has a gap in it.',
    sources: { band: true, health_connect: false, apple_health: false },
  },
];

/** A figure nothing sends us, that we compute from the rows above. */
export interface DerivedOutput {
  name: string;
  unit: string;
  /** What it is computed from. */
  inputs: string;
  /** Where it is computed, relative to qyne-service/src. */
  cite: string;
  /** Anchor of the entry that documents it, where there is one. */
  slug?: string;
}

export const DERIVED_OUTPUTS: DerivedOutput[] = [
  {
    name: 'Resting heart rate (where no source reports one)',
    unit: 'bpm',
    inputs: 'heart_rate, and the night’s sleep spans',
    cite: 'wearables/metrics/metrics.service.ts',
    slug: 'resting-heart-rate',
  },
  {
    name: 'Maximum heart rate',
    unit: 'bpm',
    inputs: 'date of birth (Tanaka). Never measured.',
    cite: 'wearables/metrics/fitness.ts',
    slug: 'vo2-max',
  },
  {
    name: 'Heart-rate reserve in use',
    unit: 'fraction, 0-1',
    inputs: 'heart_rate, resting heart rate, maximum heart rate',
    cite: 'wearables/metrics/fitness.ts',
    slug: 'strain',
  },
  {
    name: 'TRIMP (training load)',
    unit: 'load points',
    inputs: 'heart-rate reserve over time, and sex for the coefficients',
    cite: 'wearables/metrics/fitness.service.ts',
    slug: 'strain',
  },
  {
    name: 'Strain',
    unit: '0-21',
    inputs: 'TRIMP for the day',
    cite: 'wearables/metrics/fitness.ts',
    slug: 'strain',
  },
  {
    name: 'Heart-rate zones and minutes in each',
    unit: 'bpm, minutes',
    inputs: 'heart_rate, resting heart rate, maximum heart rate',
    cite: 'wearables/metrics/heart-rate.ts',
    slug: 'heart-rate',
  },
  {
    name: 'Sleep efficiency',
    unit: '%',
    inputs: 'time asleep over time in bed, from the session',
    cite: 'sleep/sleep.summary.ts',
    slug: 'sleep-score',
  },
  {
    name: 'Sleep consistency',
    unit: '0-100',
    inputs: 'bedtime and wake time against their own 7-night medians',
    cite: 'sleep/sleep.score.ts',
    slug: 'sleep-score',
  },
  {
    name: 'Sleep score and its five sub-scores',
    unit: '0-100',
    inputs: 'sleep spans and stages, overnight heart rate and HRV, the day’s strain, age',
    cite: 'sleep/sleep.score.ts',
    slug: 'sleep-score',
  },
  {
    name: 'Recovery',
    unit: '0-100',
    inputs: 'HRV, resting heart rate, respiratory rate and sleep, each against a 30-day baseline',
    cite: 'readiness/recovery.score.ts',
    slug: 'recovery',
  },
  {
    name: 'Stress',
    unit: '0-100',
    inputs: 'HRV against a log-scale baseline from deep-sleep windows',
    cite: 'wearables/metrics/stress.ts',
    slug: 'stress',
  },
  {
    name: 'Energy',
    unit: '0-100',
    inputs: 'the night’s duration and efficiency, the day’s TRIMP, and stress',
    cite: 'wearables/metrics/fitness.ts',
    slug: 'energy',
  },
  {
    name: 'VO₂ max',
    unit: 'ml/kg/min',
    inputs: 'maximum and resting heart rate',
    cite: 'wearables/metrics/fitness.ts',
    slug: 'vo2-max',
  },
  {
    name: 'Basal energy',
    unit: 'kcal/day',
    inputs: 'weight, height, age and sex (Mifflin-St Jeor)',
    cite: 'wearables/metrics/calories.ts',
    slug: 'steps-and-calories',
  },
  {
    name: 'Total energy (where no source publishes one)',
    unit: 'kcal',
    inputs: 'basal energy plus measured active energy',
    cite: 'wearables/metrics/calories.service.ts',
    slug: 'steps-and-calories',
  },
  {
    name: 'Hourly calorie split',
    unit: 'kcal',
    inputs:
      'the day’s active energy distributed in proportion to steps, where no intraday series exists',
    cite: 'wearables/metrics/calories.service.ts',
    slug: 'steps-and-calories',
  },
  {
    name: 'Baselines',
    unit: 'the figure’s own unit',
    inputs: '30 days of history for recovery, 7 nights for consistency and for the stress baseline',
    cite: 'readiness/, wearables/metrics/stress.ts',
  },
  {
    name: 'Bands and levels',
    unit: 'a label and a colour',
    inputs: 'the figure, and the band table that owns it',
    cite: 'wearables/metrics/band-colors.config.ts',
  },
];

/** One step of what happens between a sensor and a screen. */
export interface PipelineStage {
  title: string;
  body: string;
}

export const PIPELINE: PipelineStage[] = [
  {
    title: 'The phone posts, the server never pulls a device',
    body: 'The band talks Bluetooth to the phone and the phone posts canonical samples to the API. Sleep goes to its own endpoint, because a night is a session with stages inside it rather than a point measurement. Nothing is read from a device by the server, so a phone that has not opened in three days has three days to upload.',
  },
  {
    title: 'Every sample names what it is',
    body: 'A sample carries a type, a value, an optional unit and the instant it was taken. An unrecognised type is rejected with a reason rather than stored as something near it, and the rejection is reported back rather than swallowed.',
  },
  {
    title: 'Units are converted, not assumed',
    body: 'A declared unit is converted into the metric’s canonical one. An unrecognised unit is a rejection. A sample that declares nothing is trusted to be canonical already, which keeps older app builds working unchanged.',
  },
  {
    title: 'Implausible values are refused',
    body: 'Each metric declares bounds and a reading outside them never reaches storage. The bounds are per metric for a reason: 190 bpm is a plausible beat and an implausible resting figure, so a value remapped from one to the other is validated against the target’s bounds, not the sender’s.',
  },
  {
    title: 'Two meanings never share a name',
    body: 'HRV must arrive as a named statistic, and a provider that declares none is refused outright. Cumulative day totals and per-interval deltas have separate names. An already-resting heart rate and a raw stream have separate names. Each of those splits exists because one name once meant two things and nothing errored.',
  },
  {
    title: 'A reading is identified by source, metric and instant',
    body: 'Re-uploading the same reading replaces it rather than doubling it, which is what makes a phone free to re-send a window it is unsure about. The same key twice inside one batch fails that batch, so the app collapses repeats before sending.',
  },
  {
    title: 'Days are the athlete’s own local days',
    body: 'A day boundary is one rule, applied in the athlete’s own time zone, and it lives in one module. A sleep day runs noon to noon, so a night beginning on Monday evening is scored against Monday’s training, which is the day it has to recover from.',
  },
  {
    title: 'Many readings become one figure, per metric',
    body: 'A cumulative total rolls up with a maximum, a per-interval delta with a sum, a resting heart rate with a median or a low percentile. The rule belongs to the metric, never to the caller.',
  },
  {
    title: 'One source wins a chart',
    body: 'Where several sources hold the same figure, the QYNE band wins if it has readings in the window and otherwise the source with the most. One provider and one statistic for the whole series: averaging two devices produces a number neither measured.',
  },
  {
    title: 'A baseline is the athlete’s own history',
    body: 'Recovery scores its inputs against 30 days, consistency against the last 7 nights, stress against a log-scale distribution built from deep-sleep windows with at least 7 nights behind it. A baseline with no real spread is rejected rather than scored against.',
  },
  {
    title: 'The derivation is pure',
    body: 'Every formula on this page is a pure function: it takes its inputs and returns a figure with no clock, no database and no environment. The thin service around it fetches and stores. That is why a band can be re-tested without a database and why one figure has exactly one producer.',
  },
  {
    title: 'The band and its colour are decided on the server',
    body: 'A figure travels with its band, its tone and a colour for each theme. A client that bands a number itself will eventually disagree with the server about the same reading, and it has: two rules for one HRV reading put an athlete in the green band on one screen and the amber band on another.',
  },
  {
    title: 'A figure we cannot compute is absent, with a reason',
    body: 'Not a zero, not a sample value, not a half-filled bar. The response names what was missing, so a screen can say "add your date of birth" rather than draw an empty card. A reading retracted later, such as steps that turn out to be vehicle motion, is excluded, and anything computed from that denominator is withheld rather than quietly recomputed.',
  },
];

/** Where the thing that produces a figure actually lives. */
export interface CodeLocation {
  area: string;
  path: string;
  note: string;
}

/**
 * The map an engineer needs before changing a metric.
 *
 * Paths rather than prose, because the first question when a figure looks wrong
 * is always "where is it computed", and the second is "what else reads it".
 */
export const CODE_MAP: CodeLocation[] = [
  {
    area: 'Pure metric formulas',
    path: 'qyne-service src/wearables/metrics/',
    note: 'fitness.ts (strain, TRIMP, energy, VO₂ max, Tanaka, Karvonen), stress.ts, heart-rate.ts, calories.ts, metrics.service.ts. Pure functions; the services around them fetch and store.',
  },
  {
    area: 'Recovery',
    path: 'qyne-service src/readiness/',
    note: 'recovery.score.ts holds the weights and the illness gate; recovery.ts holds the bands and the contributor list; recovery.shape.ts decides what a card is allowed to paint.',
  },
  {
    area: 'Sleep',
    path: 'qyne-service src/sleep/',
    note: 'sleep.score.ts (five sub-scores, targets, consistency), sleep.summary.ts (the window figures), sleep.derive.ts (main night against naps), sleep.service.ts (what the screen gets).',
  },
  {
    area: 'Band tables and colours',
    path: 'qyne-service src/wearables/metrics/*-bands.config.ts',
    note: 'One config per banded metric, plus band-colors.config.ts, which is the only place a band colour is decided. Copy changes land here and nowhere near the arithmetic.',
  },
  {
    area: 'Canonical names, units and bounds',
    path: 'qyne-service src/wearables/domain/canonical.ts',
    note: 'The metric vocabulary, the unit list, and the sport vocabulary. Add here before anything else.',
  },
  {
    area: 'Ingest and per-provider mapping',
    path: 'qyne-service src/wearables/providers/',
    note: 'health-samples.ts carries the specs and bounds shared by both phone platforms; jc-vita/, apple-health/ and health-connect/ carry each provider’s remaps.',
  },
  {
    area: 'Vehicle-step policy',
    path: 'qyne-service src/wearables/domain/vehicle-steps.ts',
    note: 'The four-condition veto and its thresholds. The app uploads the measurement; the policy is server-side.',
  },
  {
    area: 'Decisions that bind all of the above',
    path: 'qyne-service docs/decisions/',
    note: '0006 one producer per figure, 0007 HRV measured during sleep, 0008 VO₂ cohort percentile. Read 0006 before adding any surface.',
  },
  {
    area: 'Band protocol and platform reads',
    path: 'qyne-app apps/native/src/ble/ and src/health/',
    note: 'What the band exposes per opcode, and which HealthKit and Health Connect record types the phone asks for. A metric the app never reads cannot arrive however well the server handles it.',
  },
  {
    area: 'Telemetry upload',
    path: 'qyne-app apps/native/src/services/band.ts',
    note: 'The one place samples are named and posted, for both the band and the phone platforms. The per-source columns on this page come from here.',
  },
  {
    area: 'Shared client types',
    path: 'qyne-app packages/core/src/types.ts',
    note: 'The response shapes both apps read. A new field on a figure starts here.',
  },
  {
    area: 'This page',
    path: 'qyne-web src/data/metricDocs.ts and src/data/metricPipeline.ts',
    note: 'All content is data. Changing a metric means changing its entry in the same pull request, which is what the org standards now require.',
  },
];
