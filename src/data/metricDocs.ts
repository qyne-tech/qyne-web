/**
 * What every metric in the app means, how it is produced, and what a figure is
 * worth comparing against. This is the content behind /doc.
 *
 * ## Why it lives in one file
 *
 * The same number is drawn on a card, on a detail screen and on this page. If
 * the page restates a threshold by hand it drifts from the server the first
 * time a band moves, and a documentation page that is quietly wrong is worse
 * than none: it is the page somebody quotes in a support ticket.
 *
 * So every band, weight, equation and constant below is transcribed from the
 * service that produces it, and each entry cites the file it came from. When a
 * formula moves, the citation is the thing to grep for. Band labels and tones
 * are the shipped ones, including where the shipped copy reads oddly: this page
 * documents the app, not an improved version of it.
 *
 * ## One entry per figure
 *
 * Each figure an athlete can see gets its own entry, even where two share a
 * screen. Steps and calories are different measurements with different units,
 * different rollups and different failure modes, and documenting them together
 * hides that one of them is measured and the other is partly estimated.
 *
 * Bands carry numeric bounds rather than only a display string, so the table
 * and the scale bar are drawn from the same numbers and cannot disagree about
 * where a band starts.
 *
 * Sources named here are the three wired today. `whoop`, `garmin`, `fitbit`
 * and `oura` exist in the service's provider list and are not yet connected,
 * so they are deliberately absent rather than listed as though they worked.
 */

/** A device or platform a figure can come from. */
export type SourceKey = 'band' | 'health_connect' | 'apple_health';

export const SOURCES: { key: SourceKey; label: string; note: string }[] = [
  {
    key: 'band',
    label: 'QYNE band',
    note: 'Continuous wrist sensing over Bluetooth: heart rate, HRV as SDNN, SpO₂, skin temperature, steps, active calories, distance and staged sleep. The widest coverage of the three, and the source that wins a chart whenever it has readings in it.',
  },
  {
    key: 'health_connect',
    label: 'Health Connect',
    note: 'Android. The phone reads what other apps have written, so coverage depends on what else the athlete uses. Its HRV is RMSSD, and it is the one source that commonly reports total calories rather than active.',
  },
  {
    key: 'apple_health',
    label: 'Apple Health',
    note: 'iOS. The same shape: the watch and other apps write, the phone reads. Its HRV is SDNN, and it is read as a platform rather than as a watch, because HealthKit aggregates every device the athlete has granted it.',
  },
];

/** How a source supplies a metric, which is not the same as whether it has it. */
export type Supply =
  /** Measured by the source itself and stored as it arrived. */
  | 'measured'
  /** Computed by QYNE from something the source does measure. */
  | 'derived'
  /** Nothing wired today sends it. */
  | 'none';

export const SUPPLY_LABELS: Record<Supply, string> = {
  measured: 'Measured',
  derived: 'Derived',
  none: 'No source yet',
};

/**
 * Every tone the app's band tables carry, mirroring the service's own list so a
 * band's colour can be read straight from its config rather than approximated.
 *
 * `neutral` and `critical` are not decoration. Strain's "Moderate" is neutral
 * because an ordinary day is not a warning and painting it amber said it was,
 * and energy needs two distinct shades of bad because it has two bands below
 * "Drained". Collapsing either would render four bands as three. The last four
 * are the sleep stages, which are coloured rather than banded.
 */
export type Tone =
  // The four-step scale every scored metric is banded on, best first. Read
  // from the GOOD end of the metric's own range, which is the LOW end for
  // Strain and Stress. A three-band metric has no teal: its green covers the
  // top two steps.
  | 'green'
  | 'teal'
  | 'amber'
  | 'red'
  // The categorical tones, for figures that are not a judgement. Sleep stages
  // are the case: deep is not better than REM, it is a different thing.
  | 'deep_sleep'
  | 'light_sleep'
  | 'rem'
  | 'awake'
  // The semantic tones. VO2 max still uses these: it has five bands, and
  // which two of the five share a colour on a four-step scale is a decision
  // nobody has made yet.
  | 'success'
  | 'info'
  | 'neutral'
  | 'warning'
  | 'danger'
  | 'critical';

/** A closed numeric span, in the metric's own unit. */
export interface Interval {
  from: number;
  to: number;
}

export interface BandRow {
  label: string;
  /**
   * The spans this band covers. One for most metrics; two where a band is
   * two-sided, as respiratory rate's are, because too low and too high are the
   * same band and must not be drawn as one continuous block.
   *
   * An open-ended band carries a drawing bound here and the truth in
   * `rangeLabel`: the bar needs a number to stop at, the reader does not.
   */
  ranges: Interval[];
  /** The shipped range copy, where it says it better than the bounds do. */
  rangeLabel?: string;
  tone: Tone;
  meaning: string;
}

/** One named part of a formula, written as an equation. */
export interface FormulaTerm {
  name: string;
  expression: string;
  note?: string;
}

/** A constant the formula uses, its value, and why it has that value. */
export interface FormulaConstant {
  symbol: string;
  value: string;
  why: string;
  /**
   * True where the code itself flags the value as chosen rather than sourced:
   * provisional, fitted against too little data, or a convention. The internal
   * page collects these, because a figure built on one of them is a figure that
   * will move when somebody finally fits it.
   */
  provisional?: boolean;
}

/**
 * A plotted formula. The function is the formula itself rather than a list of
 * points, so the curve on the page is the arithmetic described beside it and
 * nobody has to keep a sampled table in step with a changing constant.
 */
export interface Figure {
  title: string;
  caption: string;
  x: { label: string; min: number; max: number; ticks: number[] };
  y: { label: string; min: number; max: number; ticks: number[] };
  fn: (x: number) => number;
}

/** Which part of the app a metric belongs to, used to group the index. */
export type MetricGroup = 'scores' | 'sleep' | 'signals' | 'fitness' | 'activity';

export const METRIC_GROUPS: { key: MetricGroup; label: string; blurb: string }[] = [
  {
    key: 'scores',
    label: 'Daily scores',
    blurb: 'Composite figures. Each one weighs several measurements into a single number.',
  },
  {
    key: 'sleep',
    label: 'Sleep',
    blurb: 'The night, and the four figures the app reports about it separately.',
  },
  {
    key: 'signals',
    label: 'Body signals',
    blurb: 'Measured quantities. These are the inputs every score above is built from.',
  },
  {
    key: 'fitness',
    label: 'Fitness',
    blurb: 'Slow-moving estimates that respond to months of training, not to one session.',
  },
  {
    key: 'activity',
    label: 'Activity',
    blurb: 'Counted movement, and the energy attributed to it.',
  },
];

export interface MetricDoc {
  slug: string;
  name: string;
  group: MetricGroup;
  /** One line, for the index and the card. */
  summary: string;
  unit: string;
  /**
   * What moves the figure, and what the band thresholds adjust for.
   *
   * Required on every metric, because the honest answer is usually "the figure
   * depends on your age and sex and the bands do not", and a page that leaves
   * that out invites an athlete to compare a band with somebody it was never
   * cut for.
   */
  dependsOn: {
    /** What the figure itself varies with. */
    figure: string;
    /** What the band thresholds adjust for, or that there are none. */
    bands: string;
  };
  /** What the athlete actually sees, screen by screen. */
  shown: string[];
  /** The formula, written as the service computes it. */
  formula: {
    /** The headline equation, where the figure has one. */
    expression?: string;
    /** Each part of it, expanded. */
    terms?: FormulaTerm[];
    /** What does not fit an equation: precedence, rejections, empty states. */
    steps: string[];
    /** Every constant above, with its value. */
    constants?: FormulaConstant[];
    cite: string;
  };
  /** The scale a figure is read against, and whether it is personal. */
  bands?: { basis: 'personal' | 'generic'; note: string; rows: BandRow[] };
  /**
   * A colour legend, for a figure that is coloured without being banded. Sleep
   * stages are the case: four colours, no thresholds.
   */
  swatches?: { note: string; rows: { label: string; tone: Tone; meaning: string }[] };
  /** A worked case, with real arithmetic. */
  example?: { title: string; lines: string[] };
  figure?: Figure;
  /** What the number is for, and what it cannot tell you. */
  significance: { why: string; limits: string[] };
  supply: Record<SourceKey, Supply>;
}

/** One span, as the table prints it. */
function printInterval(range: Interval): string {
  return `${range.from}-${range.to}`;
}

/**
 * A band's range for display: the shipped copy where there is any, and
 * otherwise the bounds the bar is drawn from. One producer, so the two halves
 * of the component cannot disagree.
 */
export function formatRange(band: BandRow): string {
  return band.rangeLabel ?? band.ranges.map(printInterval).join(' or ');
}

export const METRIC_DOCS: MetricDoc[] = [
  {
    slug: 'recovery',
    name: 'Recovery',
    group: 'scores',
    summary: 'What state the athlete woke in, scored against their own 30-day normal.',
    unit: '0-100',
    dependsOn: {
      figure:
        'Age, through the sleep target inside its sleep term. Every other input is compared with your own 30-day baseline, so sex and body size enter only through your own history.',
      bands: 'Nothing. One table for every age and sex.',
    },
    shown: [
      'A ring on the device screen and at the top of the Recovery screen.',
      'Five contributor rows (HRV, resting heart rate, respiratory rate, sleep quality and sleep consistency), each with the athlete’s own baseline beside it. Four of them carry weight; sleep consistency is shown for context.',
      'Which HRV statistic was used, what was missing, and how much of the intended weight the figure actually rests on.',
    ],
    formula: {
      expression: 'Recovery = Σ(wᵢ · Sᵢ) / Σwᵢ over the inputs that were measured',
      terms: [
        {
          name: 'z-score, every term',
          expression: 'z = (x − mean₃₀) / sd₃₀',
          note: 'x is today’s figure; the mean and standard deviation are the athlete’s own, over 30 days. Never a population.',
        },
        {
          name: 'S_HRV, weight 0.40',
          expression: 'clamp(50 + z × 25, 0, 100)',
          note: 'Higher is better, so a z of +1 reads 75.',
        },
        {
          name: 'S_RHR, weight 0.25',
          expression: 'clamp(50 − z × 25, 0, 100)',
          note: 'Inverted: a resting heart rate above baseline is worse, so a z of +1 reads 25.',
        },
        {
          name: 'S_Sleep, weight 0.25',
          expression: 'clamp(asleep / target × 100) × 0.70 + Q_stage × 0.30',
          note: 'Renormalised to duration alone where a source reports no stages.',
        },
        {
          name: 'Q_stage',
          expression: 'clamp(((deep + REM) / asleep) / 0.45 × 100, 0, 100)',
          note: 'The specification weights stage quality at 0.30 and never defines it. The 45% share is ours.',
        },
        {
          name: 'S_RR, weight 0.10',
          expression: 'z ≤ 0 → 100, otherwise clamp(100 − z × 35, 0, 100)',
          note: 'One-sided and steeper than the rest: breathing below baseline is not a bonus.',
        },
        {
          name: 'Illness gate',
          expression: 'z_RR ≥ +2.5 → Recovery = min(Recovery, 33)',
          note: 'Caps the figure into the red band however good the other three terms look.',
        },
      ],
      steps: [
        'A missing term is dropped and the remaining weights re-normalised, never defaulted to 50. Scoring an input we never measured as "average" is a claim about the athlete; dropping it and saying so is not.',
        'The response reports which inputs were used, which were missing, and the share of the intended weight the figure rests on.',
        'A term with no baseline yet draws no bar at all rather than a half-filled one: a mid bar reads as "mediocre" when the truth is "we do not know yet".',
        'The band that produces almost all of our HRV reports SDNN, and the specification names RMSSD. A z-score is statistic-agnostic so the arithmetic is unchanged, but the figure is a deviation in SDNN and the response says so.',
      ],
      constants: [
        {
          symbol: 'weights',
          value: 'HRV 0.40, RHR 0.25, sleep 0.25, RR 0.10',
          why: 'Fixed by the specification. They sum to 1.',
        },
        {
          symbol: 'Z_TO_POINTS',
          value: '25',
          why: 'Points per standard deviation, so ±2σ spans the scale.',
        },
        {
          symbol: 'RR_Z_TO_POINTS',
          value: '35',
          why: 'The steeper slope the specification gives the respiratory penalty.',
        },
        {
          symbol: 'ILLNESS_GATE_Z',
          value: '2.5',
          why: 'Where an elevated respiratory rate is treated as illness.',
        },
        { symbol: 'ILLNESS_GATE_CAP', value: '33', why: 'The top of the red band.' },
        { symbol: 'BASELINE_DAYS', value: '30', why: 'The window the specification asks for.' },
        {
          symbol: 'MIN_BASELINE_DAYS',
          value: '7',
          why: 'Below this a z-score means nothing and no figure is reported.',
        },
        {
          symbol: 'STAGE_TARGET_SHARE',
          value: '0.45',
          why: 'Deep plus REM as a share of a well-slept night. Ours, not the specification’s.',
          provisional: true,
        },
      ],
      cite: 'qyne-service src/readiness/recovery.score.ts',
    },
    bands: {
      basis: 'generic',
      note: 'The inputs are compared with the athlete’s own baseline; the bands themselves are one table for everybody. Both halves of that sentence matter, and the response declares which in its bands-basis field. The colours run best to worst — green, amber, red — read from the top. Recovery has three bands, so there is no teal step between green and amber.',
      rows: [
        {
          label: 'Good',
          ranges: [{ from: 67, to: 100 }],
          tone: 'green',
          meaning: 'At or above your own baseline. Good to push.',
        },
        {
          label: 'Moderate',
          ranges: [{ from: 34, to: 66 }],
          tone: 'amber',
          meaning: 'Enough in the tank for work, not for a peak.',
        },
        {
          label: 'Low',
          ranges: [{ from: 0, to: 33 }],
          tone: 'red',
          meaning: 'Prioritise recovery. The body is still carrying yesterday.',
        },
      ],
    },
    example: {
      title:
        'HRV 1.2σ above baseline, resting heart rate 0.4σ above, 7h20m against an 8h target with 44% deep plus REM, no respiratory rate.',
      lines: [
        'S_HRV = 50 + 1.2 × 25 = 80',
        'S_RHR = 50 − 0.4 × 25 = 40',
        'Q_stage = (0.44 / 0.45) × 100 = 98 → S_Sleep = (440/480 × 100) × 0.70 + 98 × 0.30 = 64 + 29 = 93',
        'S_RR is missing, so the weights in play are 0.40 + 0.25 + 0.25 = 0.90',
        'Recovery = (0.40·80 + 0.25·40 + 0.25·93) / 0.90 = 65.3 / 0.90 = 73 → Good',
      ],
    },
    significance: {
      why: 'Recovery answers what you woke up with. It is the figure to plan the day against, and the one that should move a hard session rather than be noticed on the way out of it.',
      limits: [
        'It describes the morning, not the moment. Energy is the figure that falls through the day.',
        'A new athlete has no baseline, so the score is withheld rather than guessed.',
        'The bands are a general scale. Two athletes both reading 70 are not equally recovered in any absolute sense.',
        'Respiratory rate carries a tenth of the weight and no wired source sends it yet, so in practice the figure rests on the other three and reports that it did.',
      ],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'energy',
    name: 'Energy',
    group: 'scores',
    summary: 'What the night charged, less what the day has spent.',
    unit: '0-100',
    dependsOn: {
      figure:
        'Age and sex, through the day’s TRIMP: age sets the predicted maximum and sex sets the Banister coefficients. The sleep goal here is a flat eight hours and is deliberately not age-bracketed, unlike the sleep score’s target.',
      bands: 'Nothing. One table for every age and sex.',
    },
    shown: [
      'A ring on the device screen and at the top of the Energy screen.',
      'The three terms that move it (sleep, strain and stress), each sized so the card reads as a waterfall.',
      'Two further rows shown for context, which are not terms.',
    ],
    formula: {
      expression: 'Energy = clamp(charge × e^(−TRIMP/700) − penalty, 0, 100)',
      terms: [
        {
          name: 'charge',
          expression: '100 × (0.75 × min(1, asleep/480) + 0.25 × min(1, efficiency/100))',
          note: 'What the night put in. The duration half caps at the goal: eleven hours against eight is not more than a full charge.',
        },
        {
          name: 'charge, no efficiency reported',
          expression: '100 × min(1, asleep/480)',
          note: 'The term is dropped and duration carries the charge, rather than efficiency being scored as zero.',
        },
        {
          name: 'drain, as the card reports it',
          expression: 'charge × (1 − e^(−TRIMP/700))',
          note: 'The term itself multiplies; reporting it as the gap the multiplication opened is what makes charge − drain − penalty add up exactly.',
        },
        {
          name: 'penalty',
          expression: '0.4 × max(0, stress − 50)',
          note: 'Caps at 20, reached at a stress of 100. One-sided: HRV above baseline is not evidence of a reserve larger than the night earned.',
        },
      ],
      steps: [
        'No night or no day’s load means no figure and a stated reason, never a zero. Stress is the one optional input, because no baseline yet is a normal early state and it only ever subtracts.',
        'The drain is re-derived from TRIMP rather than from the 0-21 strain scale, which is presentation.',
        'HRV and recovery appear on the screen but are not terms. HRV reaches the figure only through stress, and the recovery score does not enter at all.',
        'On a day that floors at 0 the three terms sum lower than the figure, because the arithmetic went below the scale.',
      ],
      constants: [
        {
          symbol: 'ENERGY_SLEEP_GOAL_MINUTES',
          value: '480',
          why: 'Eight hours, the midpoint of the 7-9 h an adult is recommended. The same default the sleep terms use, so two figures cannot disagree about "enough sleep".',
        },
        {
          symbol: 'ENERGY_DURATION_WEIGHT',
          value: '0.75',
          why: 'Duration carries most of it: the dose-response work on sleep restriction is about hours lost. Provisional, a judgement rather than a published coefficient.',
          provisional: true,
        },
        {
          symbol: 'ENERGY_EFFICIENCY_WEIGHT',
          value: '0.25',
          why: 'A fragmented eight hours is not a restful eight hours.',
          provisional: true,
        },
        {
          symbol: 'ENERGY_DRAIN_TRIMP',
          value: '700',
          why: 'The TRIMP at which about a third of the reserve is gone. An ordinary worn day of 100-250 keeps 70-86%; a hard session on top takes it to about 57%.',
          provisional: true,
        },
        {
          symbol: 'ENERGY_STRESS_PENALTY',
          value: '0.4',
          why: 'Points per point of stress above baseline, which bounds the autonomic term at 20.',
          provisional: true,
        },
      ],
      cite: 'qyne-service src/wearables/metrics/fitness.ts',
    },
    bands: {
      basis: 'generic',
      note: 'Deliberately not the recovery thresholds. Recovery asks what state you woke in; energy asks what is left of it now. The colours run best to worst — green, teal, amber, red — read from the top, so Optimal is the teal second step and Depleted the red floor.',
      rows: [
        {
          label: 'Fully Charged',
          ranges: [{ from: 80, to: 100 }],
          tone: 'green',
          meaning: 'Good for the hardest session you had planned.',
        },
        {
          label: 'Optimal',
          ranges: [{ from: 50, to: 79 }],
          tone: 'teal',
          meaning: 'Enough for ordinary work.',
        },
        {
          label: 'Drained',
          ranges: [{ from: 20, to: 49 }],
          tone: 'amber',
          meaning: 'Keep it easy.',
        },
        {
          label: 'Depleted',
          ranges: [{ from: 0, to: 19 }],
          tone: 'red',
          meaning: 'Little left. Treat today as recovery.',
        },
      ],
    },
    example: {
      title: '7h asleep at 91% efficiency, a TRIMP of 240 by late afternoon, stress 62.',
      lines: [
        'charge = 100 × (0.75 × min(1, 420/480) + 0.25 × 0.91) = 100 × (0.656 + 0.228) = 88.4',
        'e^(−240/700) = 0.710 → charge × 0.710 = 62.8, so the drain reads 88.4 − 62.8 = 25.6',
        'penalty = 0.4 × (62 − 50) = 4.8',
        'Energy = 62.8 − 4.8 = 58 → Optimal',
      ],
    },
    figure: {
      title: 'How the day drains the night',
      caption:
        'The drain multiplies, so a good night is worth more on a hard day than a poor one is. A full charge of 100 still reads 60 after a TRIMP of 360, which is roughly a hard hour.',
      x: { label: 'Day TRIMP', min: 0, max: 1400, ticks: [0, 350, 700, 1050, 1400] },
      y: { label: 'Percent of charge kept', min: 0, max: 100, ticks: [0, 25, 50, 75, 100] },
      fn: (trimp) => 100 * Math.exp(-trimp / 700),
    },
    significance: {
      why: 'Recovery is the morning; energy is now. It is the figure that explains why a session planned at 7am feels wrong at 5pm, and a metric that did not deplete through the day would just be recovery under another name.',
      limits: [
        'There is no published gold standard for this metric. Body Battery, Daily Readiness and Oura’s Readiness are the industry reference points and all three are proprietary, so this reproduces none of them, only the model they share.',
        'The 0.75/0.25 split and the 700 are judgements, not published coefficients, and are marked provisional in the code.',
      ],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'strain',
    name: 'Strain',
    group: 'scores',
    summary: 'How much the day actually cost, from every heart-rate sample in it.',
    unit: '0-21',
    dependsOn: {
      figure:
        'Age, through the predicted maximum, and sex, through the Banister coefficients. The same session therefore scores differently for a man and a woman of the same age, and for two people of the same sex at different ages. Your own resting heart rate sets the other end of the reserve.',
      bands: 'Nothing. One table for every age and sex, read off a sample of two athletes.',
    },
    shown: [
      'A ring on the device screen, and a bar per day across the window.',
      'On the day tab, a curve of the load accumulating hour by hour.',
      'The sessions behind it, each with its own share, and the load that belonged to no session at all.',
    ],
    formula: {
      expression: 'Strain = 21 × (1 − e^(−TRIMP/360))',
      terms: [
        {
          name: 'Maximum heart rate (Tanaka)',
          expression: 'HRmax = 208 − 0.7 × age',
          note: 'Predicted, never measured.',
        },
        {
          name: 'Reserve in use (Karvonen)',
          expression: '%HRR = clamp((HR − HRrest) / (HRmax − HRrest), 0, 1)',
          note: 'At rest this is 0, so sitting still contributes nothing and a day scores what the athlete did rather than how long they wore the band.',
        },
        {
          name: 'One minute of load (Banister)',
          expression: 'TRIMP/min = %HRR × k₁ × e^(k₂ · %HRR)',
          note: 'Exponential because the last ten beats before maximum cost far more than the first ten above resting.',
        },
        {
          name: 'The day',
          expression: 'TRIMP = Σ over samples (span in minutes × TRIMP/min)',
          note: 'Integrated in the database over every sample, each weighted by the gap to the next one, because a month of per-second session data is not something to add up in the app.',
        },
        {
          name: 'A session’s share',
          expression: 'session TRIMP / day TRIMP × 100',
          note: 'Shares are additive; the 0-21 figures are not.',
        },
      ],
      steps: [
        'Reserve rather than percent of maximum is the whole reason strain works over a worn day. Measured against staging, a five-zone percent-of-maximum scheme gave a sedentary day 18 out of 21, because ordinary waking life sits above 50% of maximum for hours.',
        'A sample stands for the gap to the next one, capped at ten minutes, so taking the band off at 140 bpm does not file the next six hours as training.',
        'Where the profile does not give a sex, the male coefficients are used. They are the more conservative of the two across most of the range, and guessing from a name is not something this codebase does.',
        'TRIMP is the physiological quantity and the one that adds up. The 0-21 figure is presentation, and the two are returned separately: changing the curve must never be mistaken for the athlete’s load having changed.',
        'The hourly curve accumulates in TRIMP and the scale is applied once at the end, so the line only ever rises.',
        'No date of birth or no resting heart rate means no figure, and the response names which one is missing. A session the winning device has no readings for is still listed, carrying no load, rather than dropped.',
      ],
      constants: [
        {
          symbol: 'BANISTER male',
          value: 'k₁ 0.64, k₂ 1.92',
          why: 'Banister & Calvert 1980; sex-specific forms from Morton, Fitz-Clarke & Banister 1990.',
        },
        {
          symbol: 'BANISTER female',
          value: 'k₁ 0.86, k₂ 1.67',
          why: 'A flatter curve starting higher, which is the published finding: a higher lactate threshold as a fraction of reserve.',
        },
        {
          symbol: 'STRAIN_SCALE_TRIMP',
          value: '360',
          why: 'Where the display scale reaches about 63% of its range. An ordinary worn day of 100-250 TRIMP therefore lands around 9 of 21. Provisional: two athletes over about ten days with no hard training in it.',
          provisional: true,
        },
        {
          symbol: 'STRAIN_MAX',
          value: '21',
          why: 'The top of the display scale. The curve approaches it and never reaches it, so it is a ceiling rather than an attainable score.',
        },
        {
          symbol: 'MAX_SAMPLE_SPAN_SECONDS',
          value: '600',
          why: 'The most time one sample may stand for. Far longer than the band’s passive cadence and far shorter than any gap worth trusting.',
        },
      ],
      cite: 'qyne-service src/wearables/metrics/fitness.ts',
    },
    bands: {
      basis: 'generic',
      note: 'Anchored on the one measurement the scale itself was anchored on: an ordinary worn day with no training accrues 100-250 TRIMP, which is about 9 of 21, so Moderate has to contain it. Not fitted to the individual athlete. The colours read from the LOW end, because less strain is better: Light is green, All Out red, with teal and amber between. Green, teal, amber, red is still best to worst — the scale is just read upside down.',
      rows: [
        {
          label: 'All Out',
          ranges: [{ from: 18, to: 21 }],
          tone: 'red',
          meaning: 'A day that needs a real recovery day after it.',
        },
        {
          label: 'Hard',
          ranges: [{ from: 14, to: 17.9 }],
          tone: 'amber',
          meaning: 'Real training load, and worth following with something easier.',
        },
        {
          label: 'Moderate',
          ranges: [{ from: 10, to: 13.9 }],
          tone: 'teal',
          meaning: 'Where an ordinary day of movement with no hard training lands.',
        },
        {
          label: 'Light',
          ranges: [{ from: 0, to: 9.9 }],
          tone: 'green',
          meaning: 'A light day. What a rest day should look like.',
        },
      ],
    },
    example: {
      title: 'A 42-minute run at 72% of reserve, male, age 30, resting 55.',
      lines: [
        'HRmax = 208 − 0.7 × 30 = 187, so 72% of reserve is 55 + 0.72 × (187 − 55) = 150 bpm',
        'TRIMP/min = 0.72 × 0.64 × e^(1.92 × 0.72) = 0.46 × 3.99 = 1.84',
        'TRIMP = 42 × 1.84 ≈ 77',
        'Strain = 21 × (1 − e^(−77/360)) = 21 × 0.193 ≈ 4.1',
        'The same run on a day already at TRIMP 300 adds far less to the figure, because the curve has flattened there. The TRIMP still adds in full.',
      ],
    },
    figure: {
      title: 'Why the scale saturates',
      caption:
        'The first hour of work buys most of the figure, because the difference between a rest day and a moderate one matters more to an athlete than the difference between a hard day and a very hard one. It is also why two sessions of 8 are not a day of 16: what adds is each session’s TRIMP, and the scale is applied to the total once.',
      x: { label: 'Day TRIMP', min: 0, max: 900, ticks: [0, 180, 360, 540, 720, 900] },
      y: { label: 'Strain', min: 0, max: 21, ticks: [0, 7, 14, 18, 21] },
      fn: (trimp) => 21 * (1 - Math.exp(-trimp / 360)),
    },
    significance: {
      why: 'Strain is the load side of the ledger recovery is the other half of. Two athletes doing the same session do not accrue the same strain, because the weighting is against each one’s own reserve.',
      limits: [
        'Sessions do not sum to the day. The additive figure is each session’s share, not its strain.',
        'The curve’s constant is provisional and the top of the scale is inferred rather than measured.',
        'Optical heart rate at the wrist degrades with movement, and strain is an integral over exactly that signal.',
      ],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'stress',
    name: 'Stress',
    group: 'scores',
    summary: 'Autonomic load, from HRV against the athlete’s own deep-sleep baseline.',
    unit: '0-100',
    dependsOn: {
      figure:
        'Only your own history. Age and sex affect HRV strongly in absolute terms and enter here solely through the baseline your own nights build.',
      bands:
        'Nothing directly, and everything indirectly: 50 is your own baseline, so a band means the same thing relative to each athlete.',
    },
    shown: [
      'A figure and a band on the Stress screen, with a banded bar per bucket across the window.',
      'Which HRV statistic produced it, what the baseline rested on, and how many nights it held.',
      'Breathing exercises chosen for the band the athlete is in.',
    ],
    formula: {
      expression: 'Stress = clamp(50 + (z / 2) × 50, 0, 100)',
      terms: [
        {
          name: 'Baseline',
          expression: 'mean and sd of ln(HRV) over the athlete’s own nights',
          note: 'Log-transformed because HRV is right-skewed, and built from deep-sleep windows: no posture change, no digestion, no cognition.',
        },
        {
          name: 'z-score',
          expression: 'z = (mean(ln baseline) − ln(HRV today)) / sd',
          note: 'The numerator is reversed on purpose, so a DROP in HRV produces a POSITIVE z, meaning more stress. The wrong way round inverts the scale while still producing plausible numbers.',
        },
        {
          name: 'Artefact filter',
          expression: 'drop a reading where |x − median₅| / median₅ > 0.20',
          note: 'The specification applies that test to beat intervals. We never receive those, so it is applied one level up, to the HRV series itself.',
        },
      ],
      steps: [
        'Linear to two standard deviations, which lands the interpretation bands on whole sigmas: z = −2 is 0, z = −1 is 25, z = 0 is 50, z = +1 is 75, z = +2 is 100. A normal CDF would be smoother in the tails but reaches 84 at one sigma, which would call an ordinary bad night "High Stress".',
        'Baselines come from the best window a source supports, best first: deep sleep, then any recorded sleep, then the day’s motion-masked resting readings. The response names which, because the weakest of the three infers "at rest" from an absence of steps.',
        'A baseline with no real spread is rejected: ten identical readings give a sigma near zero, which would make a reading a hair off baseline score 0 or 100.',
        'No usable baseline means no figure, deliberately rather than a fallback to an absolute scale. Without the athlete’s own distribution the number would be a statement about the population, which is the error the baseline exists to prevent.',
        'A window shorter than five readings is returned untouched by the artefact filter: with three readings there is no "local" to be local to, and rejecting one would be guessing.',
      ],
      constants: [
        {
          symbol: 'Z_SATURATION',
          value: '2',
          why: 'Standard deviations at which the scale saturates. Chosen so each band is exactly one sigma wide.',
          provisional: true,
        },
        {
          symbol: 'MIN_BASELINE_NIGHTS',
          value: '7',
          why: 'The fewest nights before a z-score means anything.',
        },
        {
          symbol: 'MIN_BASELINE_SD',
          value: '0.01 log units',
          why: 'Roughly 1% night-to-night variation. A real baseline sits between 0.1 and 0.3; under a hundredth of that the device is repeating a value rather than measuring one.',
        },
        {
          symbol: 'ARTEFACT_TOLERANCE',
          value: '0.20',
          why: 'How far a reading may sit from its local median before it is treated as noise. The specification’s own figure, applied one level up.',
        },
        {
          symbol: 'ARTEFACT_WINDOW',
          value: '5 readings',
          why: 'What counts as "local". A median rather than a mean, because a mean is moved by the outlier it is meant to catch.',
        },
      ],
      cite: 'qyne-service src/wearables/metrics/stress.ts',
    },
    bands: {
      basis: 'personal',
      note: 'The same figure on two athletes therefore means the same thing relative to each of them. This is the opposite of every other band table we serve, and the response declares it. Like strain, the colours read from the LOW end — Rest is green, High red — because less stress is better.',
      rows: [
        {
          label: 'High Stress',
          ranges: [{ from: 76, to: 100 }],
          tone: 'red',
          meaning: 'HRV well below your own normal.',
        },
        {
          label: 'Medium Stress',
          ranges: [{ from: 51, to: 75 }],
          tone: 'amber',
          meaning: 'Elevated, and worth a reason.',
        },
        {
          label: 'Low Stress',
          ranges: [{ from: 26, to: 50 }],
          tone: 'teal',
          meaning: 'Ordinary daily load.',
        },
        {
          label: 'Rest / Recovery',
          ranges: [{ from: 0, to: 25 }],
          tone: 'green',
          meaning: 'Strong parasympathetic tone: the state the body repairs in.',
        },
      ],
    },
    example: {
      title:
        'An athlete whose deep-sleep SDNN baseline is 62 ms with a log sd of 0.18, reading 48 ms tonight.',
      lines: [
        'ln(62) = 4.127, ln(48) = 3.871',
        'z = (4.127 − 3.871) / 0.18 = 1.42',
        'Stress = 50 + (1.42 / 2) × 50 = 50 + 35.5 = 86 → High Stress',
        'The same 48 ms in an athlete whose baseline is 45 ms reads below 50, which is the point of a personal scale.',
      ],
    },
    significance: {
      why: 'Stress catches load that training does not explain: illness, travel, a bad week. Personal rather than absolute because HRV varies several-fold between healthy people and barely at all within one, so an SDNN of 30 ms is alarming in an athlete who normally sits at 80 and unremarkable in one who sits at 32.',
      limits: [
        'The clinical index for this is Baevsky’s, and it is not available to us: it is built from the distribution of beat intervals, and the band reports one HRV figure per measurement rather than the beats behind it.',
        'HRV is not one statistic across sources, so both figures in a comparison must be the same statistic, and the response names it.',
        'Beat-level cleaning happens on-wrist before we see anything. We inherit whatever the band applied and cannot verify it.',
        'It describes the autonomic nervous system, not mood. A calm figure on a stressful day is not a contradiction.',
      ],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'sleep-score',
    name: 'Sleep score',
    group: 'sleep',
    summary: 'Five things about last night, weighted into one figure out of 100.',
    unit: '0-100',
    dependsOn: {
      figure:
        'Age, through the target (11h at ages 3-5 down to 7.5h at 65+), and age and sex again through the strain adjustment to that target.',
      bands: 'Nothing. One table for every age and sex.',
    },
    shown: [
      'A banded bar per night at the top of the Sleep screen, on every timeline from one day to one year.',
      'The five sub-scores with the weight each one carried, and what each rested on.',
      'Across a multi-night window, the mean of the nights that had a score, never of the window’s days.',
    ],
    formula: {
      expression: 'Score = Σ(wᵢ · Sᵢ) / Σwᵢ over the sub-scores that could be computed',
      terms: [
        {
          name: 'Duration, weight 0.30',
          expression: 'min(100, asleep / target × 100)',
          note: 'Capped, because ten hours against an eight-hour target is not 125% of a night.',
        },
        {
          name: 'The target',
          expression: 'target = bracket hours + (strain / 21) × 0.75 h',
          note: 'A hard day genuinely needs more sleep than a rest day. A maximal day asks for 45 minutes more.',
        },
        {
          name: 'Architecture, weight 0.20',
          expression:
            '(min(100, (deep/asleep) / 0.20 × 100) + min(100, (REM/asleep) / 0.22 × 100)) / 2',
          note: 'Proportions rather than minutes, so a short night with normal architecture is not punished twice. Each half capped: more REM than the target is usually a rebound from having had too little.',
        },
        {
          name: 'Restorativeness, weight 0.20',
          expression:
            'mean of the halves available: clamp(dip% / 10 × 100) and clamp(HRV / baseline × 100)',
          note: 'The specification defines only the top of this scale. Each half is scaled to its own threshold so a night that misses the dip by a tenth of a percent degrades instead of scoring zero.',
        },
        {
          name: 'The overnight dip',
          expression:
            'dip% = (awake resting HR − lowest sustained night HR) / awake resting HR × 100',
          note: 'A heart rate that rises overnight is not a negative dip to be scaled; it is the absence of one, which is what the floor at zero says.',
        },
        {
          name: 'Efficiency, weight 0.15',
          expression: 'efficiency ≥ 90 → 100, otherwise clamp((efficiency − 65) / 25 × 100)',
        },
        {
          name: 'Consistency, weight 0.15',
          expression: 'clamp(100 − (average drift / 120) × 100)',
          note: 'Drift is measured against the athlete’s own 7-night medians, on a circular clock.',
        },
      ],
      steps: [
        'A sub-score that cannot be computed is dropped and the rest re-weighted. A night a source reported as one undifferentiated asleep span has no architecture term, and scoring it as 0% deep would tell the athlete their sleep architecture had collapsed when nothing measured it.',
        'The strain in the target is the DAY’s, not the night’s. A sleep day runs noon to noon, so the night beginning on Monday evening carries Monday’s key and is scored against Monday’s training, which is the day it has to recover from.',
        'An athlete with no date of birth is scored against the adult bracket, and the response says the target was assumed rather than derived from an age.',
        'Naps never enter this figure. They are reported separately.',
      ],
      constants: [
        {
          symbol: 'SLEEP_SCORE_WEIGHTS',
          value:
            'duration 0.30, architecture 0.20, restorativeness 0.20, efficiency 0.15, consistency 0.15',
          why: 'Duration carries most of it, and the two autonomic and structural terms outweigh the two behavioural ones.',
        },
        {
          symbol: 'SLEEP_TARGET_BRACKETS',
          value: '11h ages 3-5, 10h 6-12, 9h 13-17, 8h 18-64, 7.5h 65+',
          why: 'The National Sleep Foundation consensus brackets.',
        },
        {
          symbol: 'STRAIN_EXTRA_HOURS',
          value: '0.75',
          why: 'The most the day’s training can raise the night’s target.',
        },
        {
          symbol: 'SWS_TARGET / REM_TARGET',
          value: '0.20 / 0.22',
          why: 'The share of total sleep that earns full marks for each stage.',
          provisional: true,
        },
        {
          symbol: 'RHR_DIP_TARGET_PCT',
          value: '10',
          why: 'The nocturnal heart-rate dip that earns full marks. The specification’s own figure.',
        },
        {
          symbol: 'EFFICIENCY_IDEAL_PCT / FLOOR_PCT',
          value: '90 / 65',
          why: 'Full marks at or above 90%, zero at 65%, linear between.',
        },
        {
          symbol: 'CONSISTENCY_ZERO_MIN',
          value: '120',
          why: 'Average drift at which consistency reaches zero.',
        },
      ],
      cite: 'qyne-service src/sleep/sleep.score.ts',
    },
    bands: {
      basis: 'generic',
      note: 'The thresholds follow the split Fitbit and Garmin publish, with their top two bands merged. The colours are QYNE’s scored scale: green is best, amber in the middle, red worst, read from the top. Three bands, so no teal step.',
      rows: [
        {
          label: 'Good',
          ranges: [{ from: 80, to: 100 }],
          tone: 'green',
          meaning: 'A night that did its job.',
        },
        {
          label: 'Moderate',
          ranges: [{ from: 60, to: 79 }],
          tone: 'amber',
          meaning: 'Enough to function on, not enough to build on.',
        },
        {
          label: 'Poor',
          ranges: [{ from: 0, to: 59 }],
          tone: 'red',
          meaning: 'Treat the next day as recovery.',
        },
      ],
    },
    example: {
      title:
        '7h10m asleep after 8h in bed. Adult, strain of 4, 95m deep, 80m REM, dip 8%, HRV at 92% of baseline, 24 minutes of average drift.',
      lines: [
        'target = 8 + (4/21) × 0.75 = 8.14h = 489m → Duration = min(100, 430/489 × 100) = 88',
        'Architecture: deep 95/430 = 22% → (0.22/0.20) × 100 capped at 100. REM 80/430 = 18.6% → (0.186/0.22) × 100 = 85. (100 + 85)/2 = 93',
        'Restorativeness: dip 8% → (8/10) × 100 = 80. HRV → 92. (80 + 92)/2 = 86',
        'Efficiency = 430/480 = 89.6% → (89.6 − 65)/25 × 100 = 98',
        'Consistency = 100 − (24/120) × 100 = 80',
        'Score = 0.30·88 + 0.20·93 + 0.20·86 + 0.15·98 + 0.15·80 = 88 → Good',
      ],
    },
    significance: {
      why: 'Sleep is the only figure on this page the athlete can change tonight. It is also a quarter of the recovery score, which is why a poor night shows up in tomorrow’s training guidance and not only on the sleep screen.',
      limits: [
        'Stage detection from a wrist is an estimate. Deep and REM are inferred from movement and heart rate, not measured the way a lab would.',
        'Four of the five sub-scores need something beyond the sleep session itself: a strain figure, stages, an awake resting heart rate, an HRV baseline, or seven nights of history. A thin history scores on what it has and says so.',
      ],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'sleep-stages',
    name: 'Sleep stages',
    group: 'sleep',
    summary: 'How the night divided between awake, light, deep and REM.',
    unit: 'minutes and % of sleep',
    dependsOn: {
      figure: 'Nothing we apply.',
      bands:
        'No bands. The 20% deep and 22% REM targets are adult reference ranges, used unchanged at every age. That is a known simplification: stage proportions shift with age, most of all in children and over 65.',
    },
    shown: [
      'A stacked stage chart for the night, with minutes and share per stage.',
      'Across a longer window, the mean night by stage.',
      'Each stage in its own colour, decided on the server so a stage is the same colour everywhere.',
    ],
    formula: {
      terms: [
        {
          name: 'Stage minutes',
          expression: 'Σ of the spans a source labelled with that stage',
          note: 'A night arrives as a session with stage spans inside it, not as a point measurement.',
        },
        { name: 'Stage share', expression: 'stage minutes / time asleep × 100' },
        {
          name: 'Deep and REM targets',
          expression: 'deep 20% of sleep, REM 22%',
          note: 'What earns full marks in the sleep score’s architecture term.',
        },
        {
          name: 'Combined target',
          expression: '(deep + REM) / asleep against 45%',
          note: 'What the recovery score’s stage-quality term is measured against.',
        },
      ],
      steps: [
        'Taken as the source reported it. We do not re-stage a night, because we never receive the signal a stager would need.',
        'Time asleep excludes awake spans inside the session. Time in bed includes them.',
        'A source that reports one undifferentiated asleep span has no stages, which is different from having none of a stage. The architecture term is dropped rather than scored as zero.',
        'A source that reports stage DURATIONS but no span-by-span hypnogram still scores: what matters here is minutes per stage.',
      ],
      constants: [
        {
          symbol: 'Stage vocabulary',
          value: 'awake, light, deep, REM',
          why: 'The four every wired source distinguishes, where it distinguishes any.',
        },
        { symbol: 'SWS_TARGET', value: '0.20', why: 'Slow-wave share that earns full marks.' },
        { symbol: 'REM_TARGET', value: '0.22', why: 'REM share that earns full marks.' },
        {
          symbol: 'STAGE_TARGET_SHARE',
          value: '0.45',
          why: 'Deep plus REM in a well-slept night, used by recovery.',
        },
      ],
      cite: 'qyne-service src/sleep/sleep.service.ts',
    },
    swatches: {
      note: 'No thresholds, so no bands. The colours are decided on the server and sent with the figure, which is what keeps a stage the same colour on every screen.',
      rows: [
        {
          label: 'Deep',
          tone: 'deep_sleep',
          meaning: 'Slow-wave sleep. Where physical repair concentrates.',
        },
        { label: 'REM', tone: 'rem', meaning: 'Where consolidation concentrates.' },
        {
          label: 'Light',
          tone: 'light_sleep',
          meaning: 'Most of a normal night, and not a failure state.',
        },
        {
          label: 'Awake',
          tone: 'awake',
          meaning:
            'Inside the session, after falling asleep. Counts against efficiency, not against sleep.',
        },
      ],
    },
    significance: {
      why: 'Stages are what separate a long bad night from a short good one. Deep sleep is when physical repair concentrates and REM is when consolidation does, so two nights of equal length can be worth very different amounts.',
      limits: [
        'Wrist staging is an estimate with real error. Treat the shape of a night as the signal, not a ten-minute change in deep sleep.',
        'Sources disagree about stage boundaries, so a change of device can change the stage mix without anything changing in the athlete.',
      ],
    },
    supply: { band: 'measured', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'sleep-efficiency',
    name: 'Sleep efficiency',
    group: 'sleep',
    summary: 'The share of time in bed that was actually spent asleep.',
    unit: '%',
    dependsOn: {
      figure: 'Nothing. It is a ratio of two measured times.',
      bands:
        'No band on time in bed at all, deliberately. The 90% and 65% thresholds in the sub-score are the same at every age and sex.',
    },
    shown: [
      'A figure beside the sleep score, with time in bed and time asleep.',
      'On 1W, 1M, 3M and 1Y, the mean of the nights that reported it. One number, not a series: there is no chart for it.',
      'A band for the figure, except on time in bed, which deliberately carries none.',
    ],
    formula: {
      expression: 'Efficiency = time asleep / time in bed × 100',
      terms: [
        {
          name: 'Time in bed',
          expression: 'session end − session start',
          note: 'Includes awake spans inside the night.',
        },
        { name: 'Time asleep', expression: 'time in bed − awake spans inside it' },
        {
          name: 'The sleep-score term',
          expression: 'efficiency ≥ 90 → 100, otherwise clamp((efficiency − 65) / 25 × 100)',
          note: 'Nothing is gained above 90%, because time in bed is not meant to be spent entirely asleep.',
        },
        {
          name: 'A multi-night window',
          expression: 'mean over the nights that have an efficiency',
          note: 'Over nights, never over the window’s days: a window with four recorded nights divides by four, not by seven.',
        },
      ],
      steps: [
        'Both ends come from the session as the source recorded it. A source that reports no awake spans reports no efficiency, rather than an implied 100%.',
        'Naps are excluded. Pooling a 20-minute nap at 100% efficiency with a night at 88% says nothing about either.',
        'Time in bed is reported with no band at all. There is no healthy range for how long somebody lies in bed, and attaching one would invent a judgement.',
      ],
      constants: [
        {
          symbol: 'EFFICIENCY_IDEAL_PCT',
          value: '90',
          why: 'At or above this the sub-score is 100. The figure itself is still reported exactly.',
        },
        { symbol: 'EFFICIENCY_FLOOR_PCT', value: '65', why: 'Where the sub-score reaches zero.' },
      ],
      cite: 'qyne-service src/sleep/sleep.summary.ts',
    },
    figure: {
      title: 'The efficiency sub-score',
      caption:
        'Nothing is gained above 90%. Below 65% the sub-score has already floored, so a worse night moves the sleep score only through its other four terms. The reported efficiency itself is linear and uncapped.',
      x: { label: 'Sleep efficiency (%)', min: 55, max: 100, ticks: [55, 65, 75, 85, 90, 100] },
      y: { label: 'Sub-score', min: 0, max: 100, ticks: [0, 25, 50, 75, 100] },
      fn: (efficiency) => Math.min(100, Math.max(0, ((efficiency - 65) / 25) * 100)),
    },
    significance: {
      why: 'Efficiency separates "I was in bed for nine hours" from "I slept for nine hours". It is the figure that moves when somebody is going to bed too early, drinking late, or waking repeatedly without remembering it.',
      limits: [
        'It depends entirely on a source detecting wakefulness, which a wrist does imperfectly. Quiet wakefulness reads as sleep.',
        'A high efficiency on a short night is not a good night. Duration is a separate figure for that reason.',
      ],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'sleep-consistency',
    name: 'Sleep consistency',
    group: 'sleep',
    summary: 'How close bedtime and wake time stayed to the athlete’s own routine.',
    unit: '0-100',
    dependsOn: {
      figure: 'Only your own last seven nights.',
      bands: 'No bands.',
    },
    shown: [
      'A figure beside the sleep score, and a contributor row on the Recovery screen.',
      'On 1W, 1M, 3M and 1Y, the mean of the nights that had it. One number, not a series.',
    ],
    formula: {
      expression: 'Consistency = clamp(100 − (average drift / 120) × 100, 0, 100)',
      terms: [
        {
          name: 'Average drift',
          expression: 'mean of |bedtime − median bedtime| and |wake − median wake|',
          note: 'Both measured in minutes, on a circular clock.',
        },
        {
          name: 'The medians',
          expression: 'circular median of the last 7 nights',
          note: 'Circular because the median of 23:50, 23:55, 00:05 and 00:10 as raw minutes past midnight is about 12:00.',
        },
        {
          name: 'Circular distance',
          expression: 'min(|a − b|, 1440 − |a − b|)',
          note: 'So 23:50 and 00:10 are twenty minutes apart rather than 1,420.',
        },
      ],
      steps: [
        'Seven nights of history before the figure means anything. A first night would otherwise score 100 against its own median, which would be its own definition of consistent.',
        'Naps are excluded from the medians. Pooling them moved one athlete’s average bedtime from 00:41 to 23:12 and widened the spread from 1h18m to 5h.',
        'Zero drift is 100 and the figure falls linearly: 15 minutes of average drift reads about 88, an hour reads 50, and two hours or more reads 0.',
      ],
      constants: [
        {
          symbol: 'CONSISTENCY_WINDOW_NIGHTS',
          value: '7',
          why: 'The window the medians are taken over, and the minimum history.',
        },
        {
          symbol: 'CONSISTENCY_ZERO_MIN',
          value: '120',
          why: 'Average drift at which the figure reaches zero.',
        },
        {
          symbol: 'Clock',
          value: '1440 minutes',
          why: 'The circle every bedtime comparison is made on.',
        },
      ],
      cite: 'qyne-service src/sleep/sleep.score.ts',
    },
    example: {
      title:
        'Bedtimes of 23:40, 00:10, 23:50, 00:30, 23:35, 00:05, 23:55 and wake times within 20 minutes of 07:10.',
      lines: [
        'Circular median bedtime ≈ 23:55, so the bedtime deviations are 15, 15, 5, 35, 20, 10 and 0 minutes → mean 14.3',
        'Wake deviations average 11.0',
        'Average drift = (14.3 + 11.0) / 2 = 12.7 minutes',
        'Consistency = 100 − (12.7 / 120) × 100 = 89',
      ],
    },
    significance: {
      why: 'A regular schedule is the single most actionable thing in sleep, and the one most athletes have never been shown a number for. It is also a term in both the sleep score and the recovery screen.',
      limits: [
        'It says nothing about whether the routine is a good one. Consistently late is consistent.',
        'A shift worker or an athlete who travels will read low for reasons that are not a habit to fix.',
        'It needs seven nights, so it is absent for a new athlete rather than estimated.',
      ],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'naps',
    name: 'Naps',
    group: 'sleep',
    summary: 'Daytime sleep, reported on its own and never folded into the night.',
    unit: 'minutes',
    dependsOn: {
      figure: 'Nothing. A nap is classified by when it fell, not by who slept it.',
      bands: 'No bands.',
    },
    shown: [
      'A nap card on the day tab only, listing each nap with its start and duration.',
      'On 1W, 1M, 3M and 1Y, nap minutes are added into the sleep graph’s totals and nothing else. No nap card on those timelines.',
      'Never inside the sleep score, efficiency or consistency, on any timeline.',
    ],
    formula: {
      terms: [
        {
          name: 'A nap',
          expression: 'every sleep after the main night that is not the night itself',
          note: 'Defined the way a person would describe it: something slept after you got up.',
        },
        {
          name: 'The main night',
          expression: 'the longest sleep whose day key is this day',
          note: 'A night that ends at 07:00 on Tuesday carries Monday’s key; a nap at 14:15 on Tuesday opens Tuesday’s.',
        },
      ],
      steps: [
        'A sleep BEFORE the night is never a nap. It belongs to the day before.',
        'Two overlapping sessions are one sleep reported twice, not a sleep and a nap, and the duplicate is dropped rather than counted.',
        'A doze at 23:50 is still that day’s nap. If it grows into the main sleep, the main-sleep rule takes it back.',
        'Nap rows carry only what the card plots. Stages are the largest column on a sleep row and are not shipped for a nap.',
        'The exclusion from the night’s figures is the step that is easy to forget, and the reason it is written down: on one athlete, 38 deduplicated rows over 31 days contained 12 afternoon naps of 19 to 86 minutes, and pooling them moved average bedtime by nearly four hours.',
      ],
      cite: 'qyne-service src/sleep/sleep.derive.ts',
    },
    significance: {
      why: 'A nap is real recovery and belongs in the day’s total sleep. It is also not a night, and the figures that describe a night break when a 40-minute afternoon sleep is averaged into them.',
      limits: [
        'Nap detection is a source’s detection. A quiet hour on the sofa may or may not be recorded.',
        'Nap minutes join the graph on longer timelines but no nap-level detail is kept there, so a week’s view cannot say which day the naps fell on.',
      ],
    },
    supply: { band: 'measured', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'heart-rate',
    name: 'Heart rate',
    group: 'signals',
    summary: 'The raw stream every load figure is integrated from.',
    unit: 'bpm',
    dependsOn: {
      figure: 'Nothing. It is the measurement, stored as it arrived.',
      bands:
        'No bands. The accepted range of 20-250 bpm is the same for everybody, because it is a plausibility check rather than a judgement.',
    },
    shown: [
      'A trace across the window, with the highest and lowest reading of the period.',
      'On the day tab, the stream itself; on longer windows, the daily range.',
    ],
    formula: {
      terms: [
        {
          name: 'What a sample stands for',
          expression: 'min(gap to the next sample, 600 s)',
          note: 'The band writes at wildly different rates, so a sample is weighted by the gap to the next one rather than counted.',
        },
        {
          name: 'Period high and low',
          expression: 'max and min over the accepted samples in the window',
        },
      ],
      steps: [
        'Stored as it arrived, in beats per minute, and rejected outside 20-250: those are the raw bounds, not the resting ones, because 190 bpm is a plausible beat and an implausible rest.',
        'The band samples roughly every 6 to 10 seconds while passively monitoring and once a second inside a session. The phones send a per-minute series under a separate name, which lands in the same canonical series.',
        'A source’s own resting figure is NOT stored here. It arrives under its own name, because putting an already-resting 55 next to a mid-workout 160 in one series made every consumer average two different things.',
        'The ten-minute cap on a sample’s span is what stops a gap being read as time at a heart rate: take the band off at noon at 140 bpm and put it back at six, and without a ceiling those six hours all count.',
      ],
      constants: [
        {
          symbol: 'Accepted range',
          value: '20-250 bpm',
          why: 'Rejects noise without refusing a real sprint or a real bradycardia.',
        },
        {
          symbol: 'MAX_SAMPLE_SPAN_SECONDS',
          value: '600',
          why: 'The most time one sample may stand for. Shared with the zone and TRIMP integrations, which solve the same problem.',
        },
      ],
      cite: 'qyne-service src/wearables/providers/health-samples.ts',
    },
    significance: {
      why: 'Everything on the load side of the app is an integral over this one series: strain, zones, the resting figure where a source does not report one, and the overnight dip in the sleep score.',
      limits: [
        'Optical heart rate at the wrist degrades with movement. A sprint or a heavy lift is where it is least reliable.',
        'Coverage is a property of wear. A chart with a gap in it is usually a band that was off or flat, not a heart that stopped being measured.',
      ],
    },
    supply: { band: 'measured', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'resting-heart-rate',
    name: 'Resting heart rate',
    group: 'signals',
    summary: 'The floor the heart settles to, by the best method the source allows.',
    unit: 'bpm',
    dependsOn: {
      figure:
        'Nothing we apply. The figure is the source’s own or a percentile of your own stream.',
      bands:
        'No bands. On the Recovery screen it is read against your own 30-day baseline, which is where age and fitness enter.',
    },
    shown: [
      'A daily figure with a trend, and a contributor row on the Recovery screen.',
      'Which of the three methods produced it, per day.',
    ],
    formula: {
      terms: [
        {
          name: 'Reported, best',
          expression: 'the source’s own resting figure',
          note: 'HealthKit and Health Connect both publish one they derive themselves, typically from nocturnal and sedentary windows.',
        },
        {
          name: 'Sleeping, second',
          expression: 'lowest sustained 10-minute mean inside the night’s recorded sleep',
          note: 'Ten minutes because the clinical standard is a sustained low, not a momentary one.',
        },
        {
          name: 'Derived, last',
          expression: 'the 10th percentile of the day’s raw stream',
          note: 'A percentile rather than the minimum, so one artefactually low reading cannot define the figure.',
        },
        {
          name: 'A multi-day figure',
          expression: 'median of the daily values',
          note: 'A median of daily figures, not a percentile over the pooled readings, so one long night does not outvote the rest.',
        },
      ],
      steps: [
        'The precedence is strict and the chosen basis travels with every point, because the three are not equally good and a trend can step where the method changed.',
        'A percentile is never applied to values that are already resting: that would bias the result downwards twice. The remap of a platform’s resting figure into its own series exists so this cannot happen.',
        'The derived route is a proxy and the code says so: it is not sustained and not confined to rest, so an artefact can move it and a sedentary day lowers it.',
        'Accepted range 20-150 bpm. A resting figure outside that is rejected rather than stored.',
      ],
      constants: [
        {
          symbol: 'Bases',
          value: 'reported, sleeping, derived',
          why: 'Reported in every response, per day.',
        },
        {
          symbol: 'Sustained window',
          value: '10 minutes',
          why: 'What counts as sustained inside a night.',
        },
        {
          symbol: 'Day percentile',
          value: '10th',
          why: 'The low percentile that approximates a resting floor from a whole-day stream.',
        },
        {
          symbol: 'Accepted range',
          value: '20-150 bpm',
          why: 'Tighter than the raw stream, because this is a resting figure.',
        },
      ],
      cite: 'qyne-service src/wearables/metrics/metrics.service.ts',
    },
    significance: {
      why: 'Resting heart rate is the cheapest signal of accumulated fatigue or illness. A few beats above your normal, held for days, is worth more attention than one bad session. It is also a quarter of the recovery score and the denominator of heart-rate reserve, so it moves strain and VO₂ max too.',
      limits: [
        'The three methods are not equally good, and a trend can step where the method changed.',
        'A derived figure reads a few beats high or low depending on how sedentary the window was.',
        'Because it feeds reserve, a resting figure that drifts moves zones and strain without any change in training.',
      ],
    },
    supply: { band: 'derived', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'heart-rate-zones',
    name: 'Heart-rate zones',
    group: 'signals',
    summary: 'Five labelled bpm spans, and the minutes spent in each.',
    unit: 'bpm and minutes',
    dependsOn: {
      figure:
        'Age, through the predicted maximum, and your own resting heart rate, which anchors Z1. Not sex.',
      bands:
        'The zone percentages (60 / 70 / 80 / 90) are the same at every age and sex. The bpm spans they produce are not, because the maximum is age-predicted and Z1 starts at your own resting rate.',
    },
    shown: [
      'Minutes in each of five zones with their bpm bounds.',
      'Worn time below Z1, reported separately so the zone minutes add up to the time the band was on.',
    ],
    formula: {
      expression:
        'Z2-Z5 begin at 60 / 70 / 80 / 90% of HRmax. Z1 begins at the resting heart rate.',
      terms: [
        {
          name: 'Zone floors',
          expression: 'floor(Zn) = round(HRmax × pct), and floor(Z1) = round(HRrest)',
        },
        {
          name: 'Zone ceilings',
          expression: 'ceiling(Zn) = floor(Zn+1) − 1, and Z5 has none',
          note: 'Z5 is open-ended: an age-predicted maximum is routinely exceeded, and clamping a real measurement to it would discard the hardest minutes of the session that produced it.',
        },
        {
          name: 'Minutes in a zone',
          expression: 'Σ over samples in that zone of min(gap to next sample, 600 s)',
        },
        {
          name: 'Below Z1',
          expression: 'Σ of spans for samples under floor(Z1)',
          note: 'Mostly deep sleep. Around 3.5 hours of a 20-hour day, because the resting figure is a 10th-percentile estimate and by construction about a tenth of readings sit below it.',
        },
      ],
      steps: [
        'Percent of maximum here, heart-rate reserve for strain, and the difference is deliberate. A five-zone percent-of-maximum histogram gave a sedentary day 18 out of 21 when strain was scored that way, which is fatal for a single "how hard was today" number and harmless for a chart: a zones chart WANTS the long easy hours visible in Z1.',
        'Z1 is anchored at the resting heart rate rather than at 50% of maximum, so nearly all of a worn day lands in a zone. Reserve would put Z1’s floor at 117 bpm for a fit athlete, leaving most of a real day below the chart entirely.',
        'Below-Z1 minutes are NOT folded into Z1: Z1 is a labelled bpm span, and quietly widening it downwards would make the label wrong.',
        'No maximum or no resting figure means no zone breakdown at all. One computed from a guessed maximum is a statement about the guess.',
        'A very high resting heart rate can push Z1’s floor above Z2’s. Each floor is held at or above the one below it, so the unreachable zones collapse to zero width rather than reporting a negative span.',
        'Bounds are rounded to whole bpm once, here, so the label and the bucketing cannot disagree at the edge.',
      ],
      constants: [
        {
          symbol: 'ZONE_FLOOR_PCT_MAX',
          value: 'Z2 0.60, Z3 0.70, Z4 0.80, Z5 0.90',
          why: 'The classic five-zone model, as Polar, Garmin and British Cycling use it. A convention rather than a measurement, and not fitted to our data: changing it changes what every historical chart means.',
          provisional: true,
        },
        {
          symbol: 'Z1 floor',
          value: 'the resting heart rate',
          why: 'Keeps almost all of a worn day inside a zone.',
        },
        {
          symbol: 'MAX_SAMPLE_SPAN_SECONDS',
          value: '600',
          why: 'The most time one sample may stand for.',
        },
      ],
      cite: 'qyne-service src/wearables/metrics/heart-rate.ts',
    },
    example: {
      title: 'Resting 55, age 30, so a predicted maximum of 187.',
      lines: [
        'Z1  55-111   from resting to just under 60% of maximum',
        'Z2 112-130   60-70%',
        'Z3 131-149   70-80%',
        'Z4 150-167   80-90%',
        'Z5 168+      open-ended',
        'Below 55 bpm: reported separately, not as Z1.',
      ],
    },
    significance: {
      why: 'Zone time is how a training week is actually audited. Two athletes with the same strain can have spent it very differently, and the zone split is what shows it.',
      limits: [
        'Zones move when the resting figure or the predicted maximum moves, so a week-on-week comparison is not strictly like for like.',
        'The boundaries are a convention. They are not fitted to this athlete, this sport, or our data.',
        'A guessed maximum would make every number here wrong, which is why there is no figure without a date of birth.',
      ],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'hrv',
    name: 'Heart rate variability',
    group: 'signals',
    summary: 'The variation between heartbeats, measured while asleep.',
    unit: 'ms',
    dependsOn: {
      figure:
        'Nothing we apply. Absolute HRV falls with age and varies several-fold between healthy people, which is exactly why it is only ever read against your own baseline.',
      bands:
        'No bands. The figure is reported in milliseconds and scored elsewhere against your own trailing median.',
    },
    shown: [
      'A nightly figure with a trend, and a contributor row on the Recovery screen with the athlete’s own baseline beside it.',
      'Which statistic it is, and whether it came from sleep or from the day’s resting readings.',
    ],
    formula: {
      terms: [
        {
          name: 'The night’s figure',
          expression: 'mean of the accepted readings inside the night',
          note: 'A source that already reports one nightly figure is taken as it stands rather than re-derived.',
        },
        {
          name: 'Scored against',
          expression: 'the athlete’s own trailing median, never a population',
        },
      ],
      steps: [
        'Measured during sleep, not across the day. Daytime HRV is dominated by posture, speech and movement, so a figure averaged over a day says more about the day than about the athlete.',
        'Which statistic depends on the source: the QYNE band and Apple Health report SDNN, Health Connect reports RMSSD. They are different statistics over the same beats, with different magnitudes and no conversion between them, so each lands in its own series and they are never compared. Storing both as "HRV" made changing phone look like a physiological change.',
        'A source that will not say which statistic it sends is refused rather than guessed at. The cost of guessing is that a change of phone reads as a change in the athlete.',
        'Exactly one statistic answers a chart. Never a blend of two.',
        'Where a night has no readings, a figure derived from the day’s resting readings is labelled as such, because it is not the same quantity and a client must not caption it as though it were.',
      ],
      constants: [
        {
          symbol: 'Accepted range',
          value: '0-500 ms (1-255 from the band)',
          why: 'The band’s own protocol bounds are narrower than the canonical ones.',
        },
        {
          symbol: 'Statistics',
          value: 'SDNN (band, Apple Health), RMSSD (Health Connect)',
          why: 'Stored as separate series, never compared.',
        },
        { symbol: 'Bases', value: 'sleep, resting_day', why: 'Reported with every point.' },
      ],
      cite: 'qyne-service src/wearables/metrics/metrics.service.ts, under ADR-0007',
    },
    significance: {
      why: 'HRV is the clearest early signal of autonomic load, and it carries the largest single weight in the recovery score. It falls before performance does, which is what makes it worth watching rather than reacting to.',
      limits: [
        'Absolute values are not comparable between people, or between statistics. Only the trend against your own baseline means anything.',
        'A single night is noise. The baseline exists because one reading is not a signal.',
        'Everything upstream of the figure happens on the device: beat detection, ectopic rejection, motion masking. We inherit it and cannot verify it.',
      ],
    },
    supply: { band: 'measured', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'respiratory-rate',
    name: 'Respiratory rate',
    group: 'signals',
    summary: 'Breaths a minute overnight, and the input behind the recovery score’s illness gate.',
    unit: 'brpm',
    dependsOn: {
      figure: 'Nothing we apply.',
      bands:
        'An adult range, not adjusted for age or sex. A child breathes faster at rest, which is why the accepted range reaches down to 4 and up to 60 while this table would read a young athlete as abnormal.',
    },
    shown: [
      'A contributor row on the Recovery screen wherever a source supplies it, with the athlete’s own baseline beside it.',
      'Nothing today: no wired source sends it, so the row reports as missing and its tenth of the recovery weight is redistributed. The table below is what the app reads the moment a source arrives.',
    ],
    formula: {
      terms: [
        {
          name: 'The recovery term',
          expression: 'z ≤ 0 → 100, otherwise clamp(100 − z × 35, 0, 100)',
          note: 'One-sided and steeper than the score’s other terms.',
        },
        {
          name: 'Illness gate',
          expression: 'z ≥ +2.5 → recovery = min(recovery, 33)',
          note: 'The whole score is capped into the red band however good the other terms look.',
        },
      ],
      steps: [
        'Read from the source overnight; never derived. Deriving a continuous figure from beat-to-beat intervals would need beat capture we do not have.',
        'Accepted range 4-60 breaths a minute: four is below any living adult at rest and sixty above all but severe distress, so the bounds reject noise without refusing a real reading from a child or someone unwell.',
        'Stored in its own unit, brpm, deliberately not bpm. Two different measurements sharing one unit name is how a 14 ends up rendered as a heart rate.',
        'Nothing sends it today. HealthKit publishes a respiratory rate and Health Connect has the record, and neither has been asked for. The band reports a breath figure only alongside an ECG spot measurement, so it arrives when the athlete takes one rather than overnight.',
      ],
      constants: [
        {
          symbol: 'Accepted range',
          value: '4-60 brpm',
          why: 'Rejects noise without refusing a real reading from a child or someone unwell.',
        },
        {
          symbol: 'RR_Z_TO_POINTS',
          value: '35',
          why: 'Points per standard deviation in the recovery term, steeper than the 25 used elsewhere.',
        },
        {
          symbol: 'ILLNESS_GATE_Z',
          value: '2.5',
          why: 'Where an elevated rate is treated as illness.',
        },
        {
          symbol: 'ILLNESS_GATE_CAP',
          value: '33',
          why: 'The cap the gate applies, which is the top of the red band.',
        },
      ],
      cite: 'qyne-service src/wearables/metrics/respiratory-bands.config.ts and src/readiness/recovery.score.ts',
    },
    bands: {
      basis: 'generic',
      note: 'Two-sided: too slow and too fast are the same band. The normal adult range from the clinical literature, not fitted to the athlete.',
      rows: [
        {
          label: 'Good',
          ranges: [{ from: 12, to: 18 }],
          tone: 'success',
          meaning: 'The normal adult range at rest.',
        },
        {
          label: 'Moderate',
          ranges: [
            { from: 10, to: 11 },
            { from: 19, to: 20 },
          ],
          tone: 'warning',
          meaning: 'Just outside normal. Worth watching across a few nights.',
        },
        {
          label: 'Poor',
          ranges: [
            { from: 8, to: 9 },
            { from: 21, to: 24 },
          ],
          tone: 'danger',
          meaning: 'Well outside normal for a night at rest.',
        },
        {
          label: 'Very Poor',
          ranges: [
            { from: 4, to: 8 },
            { from: 25, to: 30 },
          ],
          rangeLabel: '< 8 or > 25',
          tone: 'critical',
          meaning: 'Far outside normal. See someone about it rather than training through it.',
        },
      ],
    },
    significance: {
      why: 'Respiratory rate is the signal that moves first. A fever can raise HRV-adjacent figures while an athlete is in no state to train, which is exactly the case the illness gate exists for.',
      limits: [
        'No wired source supplies it yet, so today it is a band table and a gate with nothing flowing through them.',
        'It is not a diagnosis. It is a reason to pay attention.',
      ],
    },
    supply: { band: 'none', health_connect: 'none', apple_health: 'none' },
  },
  {
    slug: 'blood-oxygen',
    name: 'Blood oxygen (SpO₂)',
    group: 'signals',
    summary: 'The share of haemoglobin carrying oxygen, measured at the wrist.',
    unit: '%',
    dependsOn: {
      figure: 'Nothing we apply.',
      bands:
        'No bands, deliberately. A threshold here would imply a clinical judgement we are not entitled to assert, and wrist readings carry a device-specific offset.',
    },
    shown: ['A nightly figure with a trend, on its own detail screen.'],
    formula: {
      terms: [
        {
          name: 'The night’s figure',
          expression: 'mean of the accepted readings inside the night',
        },
      ],
      steps: [
        'Read from the source and stored as it arrived. Never derived.',
        'Accepted range 50-100%. A reading below 50 from a wrist is a sensor failure rather than a measurement, and above 100 is impossible.',
        'The band takes spot measurements, on a schedule or when the athlete asks. The phones pass on whatever the platform holds, which on iOS and Android is usually a watch’s overnight sampling.',
        'Judged as a deviation from the athlete’s own normal rather than against a fixed threshold, because wrist SpO₂ has a device-specific offset.',
      ],
      constants: [
        {
          symbol: 'Accepted range',
          value: '50-100%',
          why: 'Below 50 from a wrist is a sensor failure, not a measurement.',
        },
      ],
      cite: 'qyne-service src/wearables/providers/health-samples.ts',
    },
    significance: {
      why: 'A persistent overnight drop is one of the few wrist signals associated with disordered breathing, and it is worth noticing across weeks even though no single night means much.',
      limits: [
        'A wrist pulse oximeter is not a medical one and should not be read as one. It is not cleared for diagnosis anywhere in the industry, including here.',
        'Readings degrade with cold hands, movement, tattoos and fit.',
        'There is no band table for it, because attaching one would imply a clinical threshold we are not entitled to assert.',
      ],
    },
    supply: { band: 'measured', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'skin-temperature',
    name: 'Skin temperature',
    group: 'signals',
    summary: 'Overnight wrist temperature, read as drift from your own normal.',
    unit: '°C',
    dependsOn: {
      figure: 'Nothing we apply.',
      bands:
        'No bands. It is read as drift from your own baseline, because absolute wrist temperature is not comparable between people or devices.',
    },
    shown: ['A nightly figure with a trend, on its own detail screen.'],
    formula: {
      terms: [
        {
          name: 'The night’s figure',
          expression: 'mean of the accepted readings inside the night',
        },
        {
          name: 'What is judged',
          expression: 'drift from the athlete’s own baseline, in either direction',
          note: 'Not an absolute temperature. A wrist sits several degrees below core and the offset is device-specific.',
        },
      ],
      steps: [
        'Read from the source and stored as it arrived. Never derived.',
        'Accepted range 20-45 °C, which brackets any plausible wrist reading and rejects a detached sensor reporting room temperature.',
        'On iOS the series is assembled from whichever record the athlete’s devices actually write: Apple’s own sleeping wrist temperature, a third-party body temperature, or a basal reading. Reading only Apple’s left athletes with a thermometer and an empty card.',
      ],
      constants: [
        {
          symbol: 'Accepted range',
          value: '20-45 °C',
          why: 'Brackets any plausible wrist reading; rejects a sensor reporting the room.',
        },
      ],
      cite: 'qyne-service src/wearables/providers/health-samples.ts',
    },
    significance: {
      why: 'Temperature drift is one of the earliest signals of illness, and it is strongest in combination: a drift with a raised respiratory rate and a suppressed HRV is a far stronger signal than any one of them alone.',
      limits: [
        'Skin temperature is not core temperature. It follows the room, the bedding and the season as well as the athlete.',
        'Only the deviation from your own baseline means anything. The absolute number is not comparable between people or devices.',
        'It is not a diagnosis, and it is not a fertility or ovulation measurement, which needs a basal reading taken a specific way.',
      ],
    },
    supply: { band: 'measured', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'vo2-max',
    name: 'VO₂ max',
    group: 'fitness',
    summary: 'An estimate of aerobic capacity, from the ratio of maximum to resting heart rate.',
    unit: 'ml/kg/min',
    dependsOn: {
      figure:
        'Age, through the predicted maximum of 208 − 0.7 × age, and your own resting heart rate. Not sex, not weight: both inputs are heart rates.',
      bands:
        'Nothing, and this is the table where that matters most. Published VO₂ max norms are cut by age AND sex, and the edges move a long way across them: a 25-year-old man and a 55-year-old woman both reading 46 are not in the same percentile of anything. The app must not present this classification as though it were.',
    },
    shown: [
      'A figure with its classification, and a trend across the window.',
      'The inputs behind it: the heart-rate maximum model, the maximum it predicted, the resting heart rate it divided into, and the age it used.',
    ],
    formula: {
      expression: 'VO₂ max = 15.3 × (HRmax / HRrest)',
      terms: [
        {
          name: 'Maximum heart rate (Tanaka)',
          expression: 'HRmax = 208 − 0.7 × age',
          note: 'Predicted from age, never measured.',
        },
        {
          name: 'Resting heart rate',
          expression: 'the day’s own figure, by whichever of the three methods applied',
          note: 'It moves, so the estimate moves with it.',
        },
        {
          name: 'Age',
          expression: 'fractional years between date of birth and the day',
          note: 'Fractional on purpose, because Tanaka wants a continuous age. Rounded only where it is displayed.',
        },
      ],
      steps: [
        'Uth–Sørensen (2004). The ratio is the signal: a lower resting rate for the same maximum means a larger stroke volume.',
        'No date of birth means no age-predicted maximum and therefore no figure, and the response says exactly that so the screen can offer the fix rather than an empty card.',
        'The classification below is a general scale, not a cohort percentile. A percentile against other members is a different derivation and therefore a different figure, with its own name and its own field.',
      ],
      constants: [
        {
          symbol: 'VO2_MODEL',
          value: 'uth_sorensen',
          why: 'Reported with the figure, so a client never has to assume which model produced it.',
        },
        {
          symbol: '15.3',
          value: 'ml/kg/min per unit of HR ratio',
          why: 'The Uth–Sørensen coefficient.',
        },
        {
          symbol: 'HR_MAX_MODEL',
          value: 'tanaka',
          why: '208 − 0.7 × age. Reported alongside the figure.',
        },
      ],
      cite: 'qyne-service src/wearables/metrics/fitness.ts',
    },
    bands: {
      basis: 'generic',
      note: 'Published norms are cut by age and sex, and the edges move a long way across them. This table is adjusted for neither, and the app must not claim otherwise.',
      rows: [
        {
          label: 'Superior',
          ranges: [{ from: 61, to: 75 }],
          rangeLabel: '61+',
          tone: 'success',
          meaning: 'Competitive endurance range.',
        },
        {
          label: 'Excellent',
          ranges: [{ from: 53, to: 60 }],
          tone: 'info',
          meaning: 'Well-trained.',
        },
        {
          label: 'Above Average',
          ranges: [{ from: 46, to: 52 }],
          tone: 'neutral',
          meaning: 'Fitter than most.',
        },
        {
          label: 'Average',
          ranges: [{ from: 41, to: 45 }],
          tone: 'warning',
          meaning: 'Typical for an active adult.',
        },
        {
          label: 'Below Average',
          ranges: [{ from: 15, to: 40 }],
          tone: 'danger',
          meaning: 'Aerobic work moves this fastest.',
        },
      ],
    },
    example: {
      title: 'A 30-year-old with a resting heart rate of 60.',
      lines: [
        'HRmax = 208 − 0.7 × 30 = 187',
        'VO₂ max = 15.3 × (187 / 60) = 47.7 → Above Average',
        'The same athlete at a resting 55 reads 52.0. Five beats moved the estimate nine percent, which is why the trend matters and the absolute figure does not.',
      ],
    },
    figure: {
      title: 'What actually moves the estimate',
      caption:
        'Age is fixed over a season and the predicted maximum barely varies within a band, so for one athlete the estimate is very nearly a function of resting heart rate alone. Plotted at age 30, where the predicted maximum is 187.',
      x: { label: 'Resting heart rate (bpm)', min: 40, max: 90, ticks: [40, 50, 60, 70, 80, 90] },
      y: { label: 'VO₂ max estimate', min: 20, max: 75, ticks: [20, 35, 50, 60, 75] },
      fn: (restingHr) => (15.3 * 187) / restingHr,
    },
    significance: {
      why: 'VO₂ max is the single best summary of aerobic fitness, and the one that responds to months of training rather than to one session.',
      limits: [
        'It carries roughly 8% error. It is a trend line for one athlete against themselves, not a number to compare between people.',
        'A 10 bpm error in the predicted maximum moves it by about 8% on its own, and the maximum here is predicted for everybody.',
        'Both inputs are heart rates, so it says nothing about muscular strength, economy or skill.',
      ],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'steps',
    name: 'Steps',
    group: 'activity',
    summary: 'Movement counted, by whichever counter the source runs.',
    unit: 'count',
    dependsOn: {
      figure: 'Nothing. A count is a count.',
      bands: 'No bands.',
    },
    shown: [
      'A daily total with an hourly breakdown, and a trend across the window.',
      'Where a reading has been retracted, the day is shown without it rather than with a gap.',
    ],
    formula: {
      terms: [
        {
          name: 'A running day total',
          expression: 'the largest reading of the day',
          note: 'Cumulative, so summing it would multiply-count every sync.',
        },
        {
          name: 'Per-interval detail',
          expression: 'the sum of the intervals',
          note: 'A separate metric for that reason. Sending intervals as a running total made a day of 8,000 report the busiest minute.',
        },
        {
          name: 'Vehicle-motion veto',
          expression:
            'reference ≤ 20 steps AND band ≥ 200 steps in the hour AND motion in ≥ 10 minutes of it AND the hour is inside the habitual sleep window',
          note: 'All four together, or the reading stands.',
        },
      ],
      steps: [
        'A wrist accelerometer sees a moving vehicle and a walking human as the same thing. Apple and Google separate them by validating periodicity in the raw signal; the band gives us one integer per minute and no raw-motion command, so we cannot.',
        'So we defer to a pedometer that did validate periodicity: the phone’s. On the night that motivated this, Apple Health reported 6,049 steps for the day against the band’s 16,328.',
        'Only the band is arbitrated. The phone sources are the reference, not the subject, and a reference may only ever REMOVE band steps, never add them.',
        'When anything is unknown the data is kept. The failure mode we accept is a phantom surviving; the failure mode we refuse is deleting an athlete’s real run, because a deleted measurement cannot be recovered: the device buffer is bounded and the phone’s store is a cache, not an archive.',
        'Accepted range 0-200,000 a day. A retracted reading carries a machine-readable reason rather than vanishing.',
      ],
      constants: [
        {
          symbol: 'Accepted range',
          value: '0-200,000',
          why: 'Above any real day, including an ultramarathon.',
        },
        {
          symbol: 'REFERENCE_SILENT_STEPS',
          value: '20',
          why: 'Below this the phone is treated as saying "you did not walk". Not zero, because a still passenger still registers a few counts. Chosen, not sourced.',
          provisional: true,
        },
        {
          symbol: 'BAND_HOUR_STEPS',
          value: '200',
          why: 'Roughly two minutes of real walking. Below it the disagreement is not worth acting on.',
          provisional: true,
        },
        {
          symbol: 'BAND_HOUR_MINUTES',
          value: '10',
          why: 'What separates vibration from a walk: a walk is bursty, vehicle motion is spread thin. On the bus night the band reported motion in 43 of 60 minutes.',
          provisional: true,
        },
      ],
      cite: 'qyne-service src/wearables/domain/vehicle-steps.ts',
    },
    significance: {
      why: 'Steps are the one figure every athlete already understands, and the best proxy for the movement that training does not account for.',
      limits: [
        'Counters disagree. Two devices on the same athlete on the same day will not match, and whichever source wins the chart is the one being reported.',
        'Vehicle motion can still survive the veto, which needs four conditions to hold at once.',
        'A step is not a load. An 18,000-step day of walking and a 6,000-step day of intervals are not comparable efforts, which is what strain is for.',
      ],
    },
    supply: { band: 'measured', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'calories',
    name: 'Calories',
    group: 'activity',
    summary: 'Active energy as measured, basal energy as estimated, never silently added together.',
    unit: 'kcal',
    dependsOn: {
      figure:
        'Sex, age, height and weight, all four, through Mifflin-St Jeor, which is the basal half and most of the number. The band’s active half depends on none of them: it is computed per step.',
      bands: 'No bands.',
    },
    shown: [
      'Active and basal energy separately, with the active share of the total.',
      'An hourly breakdown, and which basis produced it.',
      'No total at all where the profile is too incomplete to estimate a basal rate.',
    ],
    formula: {
      expression: 'Total = the source’s own total, else basal + active',
      terms: [
        {
          name: 'Basal rate (Mifflin-St Jeor)',
          expression: 'BMR = 10 × kg + 6.25 × cm − 5 × age + s',
          note: 's is +5 for men and −161 for women. An athlete who has not told us takes −78, the midpoint, rather than being silently assigned a sex.',
        },
        {
          name: 'Basal burn so far today',
          expression: 'BMR × the fraction of the local day elapsed',
          note: 'A card that shows a whole day of basal burn at nine in the morning overstates it by two thirds.',
        },
        {
          name: 'Active energy, from the band',
          expression: 'about 0.033 kcal per step, computed on-wrist',
          note: 'With no basal component at all.',
        },
        {
          name: 'Hourly split, where no intraday series exists',
          expression: 'hour’s active kcal = day’s active kcal × (hour’s steps / day’s steps)',
          note: 'And the response says that is what happened.',
        },
      ],
      steps: [
        'Active and total are different metrics with different names and different bounds. A resting adult burns 1,500-2,000 kcal a day doing nothing, so filing a total as an active figure roughly triples it, and an athlete who changed phone would read as having tripled their output.',
        'Sources disagree about which they publish. HealthKit reports active energy; Health Connect has both record types and plenty of Android writers populate only the total. One app writing only totals is why an athlete’s calories card read 0 for ninety-one consecutive days.',
        'Read the basis before showing a total. Where no source reports one we estimate it as basal plus active and say so; where the profile is too incomplete, the total is absent and the active figure must not be shown in its place.',
        'Mifflin-St Jeor needs weight, height, age and sex. Any missing input means no basal rate at all, rather than a default: a guessed body mass produces a confident-looking number that is simply invented, and the athlete has no way to tell.',
        'Where the day’s step denominator has been retracted as vehicle motion, the hourly split is withheld rather than redistributed over a denominator we no longer trust.',
      ],
      constants: [
        {
          symbol: 'Mifflin-St Jeor',
          value: '10·kg + 6.25·cm − 5·age, then +5 / −161 / −78',
          why: 'Better validated than Harris-Benedict in modern populations and what ACSM recommends. Still about 10% error for an individual, which is why anything built on it is labelled estimated all the way to the screen.',
        },
        {
          symbol: 'Band active energy',
          value: '≈0.033 kcal per step',
          why: 'How the band computes the figure on-wrist. Active only.',
        },
        {
          symbol: 'Accepted ranges',
          value: 'active 0-20,000 kcal, total 0-30,000 kcal',
          why: 'A wider ceiling for the total on purpose: it includes basal metabolism, so it is legitimately larger for the same athlete on the same day.',
        },
      ],
      cite: 'qyne-service src/wearables/metrics/calories.ts',
    },
    example: {
      title:
        'A 72 kg, 178 cm, 30-year-old man with 9,400 steps and the band’s own active figure of 310 kcal, at 18:00 local.',
      lines: [
        'BMR = 10 × 72 + 6.25 × 178 − 5 × 30 + 5 = 720 + 1,112.5 − 150 + 5 = 1,687.5 kcal/day',
        'Day elapsed at 18:00 = 0.75 → basal so far = 1,265 kcal',
        'No source published a total, so total = 1,265 + 310 = 1,575 kcal, labelled estimated',
        'Active share = 310 / 1,575 = 20%',
      ],
    },
    significance: {
      why: 'The split is the whole point. Basal burn is most of the number and has nothing to do with training, so an athlete comparing days should be comparing the active half.',
      limits: [
        'Calorie figures from a wrist are estimates everywhere in the industry, including here.',
        'The basal half is a population equation with about 10% error for an individual, and it is labelled estimated for that reason.',
        'A total from one source and a total from another are not comparable, because they may not be the same quantity.',
      ],
    },
    supply: { band: 'measured', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'distance',
    name: 'Distance',
    group: 'activity',
    summary: 'Walking and running distance, as the source totals it.',
    unit: 'km',
    dependsOn: {
      figure: 'Nothing we apply. The source’s own stride estimate may use height.',
      bands: 'No bands.',
    },
    shown: ['A daily total and a trend across the window, beside steps.'],
    formula: {
      terms: [
        { name: 'The day’s figure', expression: 'the largest running total reported that day' },
        {
          name: 'Unit handling',
          expression: 'converted to kilometres on arrival where a reading declares another unit',
          note: 'An unrecognised unit is a rejection rather than an assumption.',
        },
      ],
      steps: [
        'Taken from the source, which computes it from steps and a stride estimate unless it has GPS for that interval.',
        'Accepted range 0-1,000 km a day.',
        'A per-day total, like steps: cumulative, so the rollup is a maximum.',
      ],
      constants: [
        {
          symbol: 'Canonical unit',
          value: 'km',
          why: 'One unit on the server; the conversion happens once, when a reading arrives.',
        },
        {
          symbol: 'Accepted range',
          value: '0-1,000 km',
          why: 'Above any real day, including a long ride filed as distance.',
        },
      ],
      cite: 'qyne-service src/wearables/providers/health-samples.ts',
    },
    significance: {
      why: 'Distance is the figure an athlete can sanity-check against their own sense of a day, which makes it the quickest way to spot a source that is counting something else.',
      limits: [
        'Stride-estimated distance is only as good as the stride estimate, and it degrades at both walking and sprinting pace.',
        'Sources differ in what they include: some count only walking and running, others everything.',
      ],
    },
    supply: { band: 'measured', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'active-minutes',
    name: 'Active minutes',
    group: 'activity',
    summary: 'Minutes the source considered active, by its own definition.',
    unit: 'minutes',
    dependsOn: {
      figure: 'Nothing we apply. Each source decides what counts as active by its own rule.',
      bands: 'No bands.',
    },
    shown: ['A daily total and a trend across the window, beside steps and calories.'],
    formula: {
      terms: [
        { name: 'The day’s figure', expression: 'the largest running total reported that day' },
      ],
      steps: [
        'Taken from the source as a per-day total. Accepted range 0-1,440, which is one day.',
        'The definitions differ between sources and we do not reconcile them: the band’s threshold, Apple’s exercise minutes and Health Connect’s exercise sessions are three different ideas of "active".',
        'Because of that, this is the figure least worth comparing across a change of device, and the reason strain exists as a measured alternative.',
      ],
      constants: [
        {
          symbol: 'Accepted range',
          value: '0-1,440 minutes',
          why: 'One day. A larger figure is a sender error.',
        },
      ],
      cite: 'qyne-service src/wearables/providers/health-samples.ts',
    },
    significance: {
      why: 'It is the figure most athletes already track elsewhere, so it is here to be recognisable rather than to be built on.',
      limits: [
        'Not comparable between sources, and not comparable across a change of device.',
        'An intensity-blind minute count says nothing about how hard the work was. Strain and zone time are the figures for that.',
      ],
    },
    supply: { band: 'measured', health_connect: 'measured', apple_health: 'measured' },
  },
  {
    slug: 'workout-calories',
    name: 'Workout calories',
    group: 'fitness',
    summary: 'Active and total energy for one recorded session.',
    unit: 'kcal',
    dependsOn: {
      figure: "The session's own burn, plus your weight, height, age and sex for the resting part.",
      bands: 'No bands.',
    },
    shown: [
      'A workout summary: "Total Calories burnt" on a card, and "Active calories" in the details.',
    ],
    formula: {
      expression: 'total = active + (BMR / 1440) x durationMin',
      terms: [
        {
          name: 'active',
          expression: "the source's own figure for the session",
          note: 'ASSUMPTION: the source value is the active (exercise) burn. If a source reports a total instead, this would double-count rest; the assumption lives in one place.',
        },
        {
          name: 'BMR (Mifflin-St Jeor)',
          expression: '10 x weightKg + 6.25 x heightCm - 5 x age + c',
          note: 'c = +5 for male, -161 for female. kcal/day. An unknown sex has no constant, so total stays empty rather than biased by ~160.',
        },
        {
          name: 'resting over the session',
          expression: '(BMR / 1440) x durationMin',
          note: "The day's resting rate, for the minutes the session lasted.",
        },
      ],
      steps: [
        'Active is shown on its own whenever the source sends a calorie figure.',
        'Total needs weight, height, age and sex; missing any one, it is left empty, never guessed.',
        'Avg speed, shown beside it on distance sports, is simply distance / duration.',
      ],
      constants: [
        {
          symbol: '1440',
          value: '1440',
          why: 'Minutes in a day, to turn a daily BMR into a per-minute rate.',
        },
        { symbol: 'c (male)', value: '+5', why: 'Mifflin-St Jeor sex constant for men.' },
        { symbol: 'c (female)', value: '-161', why: 'Mifflin-St Jeor sex constant for women.' },
      ],
      cite: 'qyne-service/src/workouts/workout-summary.ts',
    },
    significance: {
      why: "Total is the all-in number a day's energy budget uses; active is what the session itself cost.",
      limits: [
        "Both rest on the source's own calorie figure, itself an estimate from heart rate and movement.",
        'Total is empty until the profile carries weight, height and sex.',
      ],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'workout-strain',
    name: 'Workout strain',
    group: 'fitness',
    summary: 'How hard one session was, on the 0-21 strain scale.',
    unit: '0-21',
    dependsOn: {
      figure:
        'Your heart rate through the session, against your age-predicted maximum and resting rate.',
      bands: 'No bands on the session figure.',
    },
    shown: ['"Total strain" in a workout\'s details.'],
    formula: {
      expression: 'strain = 21 x (1 - e^(-TRIMP / 360))',
      terms: [
        {
          name: 'TRIMP',
          expression: 'sum over samples of  HRr x k1 x e^(k2 x HRr) x minutes',
          note: "Banister TRIMP, integrated over the session's own heart-rate samples.",
        },
        {
          name: 'HRr (heart-rate reserve)',
          expression: '(hr - resting) / (max - resting)',
          note: 'The fraction of reserve in use. max is Tanaka (see Workout heart-rate zones).',
        },
      ],
      steps: [
        'Only a session recorded live carries the per-sample heart rate this needs; a workout read from band history has no strain figure.',
        'The same Banister curve the daily strain uses, so a session and a day sit on one scale.',
      ],
      constants: [
        {
          symbol: 'k1, k2 (male)',
          value: '0.64, 1.92',
          why: 'Banister & Calvert coefficients for the male exponential.',
        },
        {
          symbol: 'k1, k2 (female)',
          value: '0.86, 1.67',
          why: 'The female form of the same curve.',
        },
        {
          symbol: '360',
          value: '360',
          why: 'The TRIMP that maps to about two-thirds of the 0-21 scale. Saturating, so hard and very hard stay distinguishable.',
          provisional: true,
        },
      ],
      cite: 'qyne-service/src/workouts/workout-summary.ts',
    },
    significance: {
      why: 'One number for how much a session took out of you, comparable across sports.',
      limits: [
        'No figure without a live recording.',
        'Age-predicted maximum carries about +-10 bpm of error.',
      ],
    },
    supply: { band: 'derived', health_connect: 'none', apple_health: 'none' },
  },
  {
    slug: 'workout-hr-zones',
    name: 'Workout heart-rate zones',
    group: 'fitness',
    summary: 'Time spent in each of the five heart-rate zones.',
    unit: 'seconds per zone',
    dependsOn: {
      figure: 'Your heart rate through the session.',
      bands: 'The zone edges adjust for your age (maximum) and your resting rate (Z1 floor).',
    },
    shown: ['The "Heart Rate Zones" bars, and the Average / Max / Recovery row above them.'],
    formula: {
      expression: 'HRmax = 208 - 0.7 x age',
      terms: [
        {
          name: 'Z1 floor',
          expression: 'resting heart rate',
          note: 'The recovery zone starts at rest.',
        },
        {
          name: 'Z2-Z5 floors',
          expression: 'HRmax x zonePct',
          note: 'Each upper zone starts at a fixed fraction of maximum.',
        },
        {
          name: 'time in a zone',
          expression: 'sum of the seconds each sample stands for, bucketed by the zone it falls in',
        },
      ],
      steps: [
        'Maximum is age-predicted by Tanaka, not measured.',
        'A zone whose floor would fall below the one beneath it collapses to zero width rather than overlapping.',
        'Only a live recording carries the samples; a band-history workout shows no zones.',
      ],
      constants: [
        {
          symbol: 'Tanaka',
          value: '208 - 0.7 x age',
          why: 'Age-predicted maximum heart rate (Tanaka et al., 2001).',
        },
      ],
      cite: 'qyne-service/src/workouts/workout-summary.ts',
    },
    significance: {
      why: 'Shows where the effort sat: a session mostly in Z2 is endurance, one in Z4-Z5 is intervals.',
      limits: ['The maximum is predicted from age, so the top zones carry its error.'],
    },
    supply: { band: 'derived', health_connect: 'none', apple_health: 'none' },
  },
  {
    slug: 'workout-recovery',
    name: 'Workout heart-rate recovery',
    group: 'fitness',
    summary: 'How fast your heart rate fell at the end of the session.',
    unit: 'bpm/min',
    dependsOn: {
      figure: 'Your heart rate over the last minute of the recording.',
      bands: 'No bands.',
    },
    shown: ['"Recovery" in the row above the zone chart.'],
    formula: {
      expression: 'recovery = max(0, hr[end - 60s] - hr[end])',
      terms: [
        {
          name: 'the drop',
          expression: 'the reading a minute before the last sample, minus the last sample',
        },
      ],
      steps: [
        'Empty unless the recording runs long enough to hold the minute-long window.',
        'Clamped at zero, so a session that ended on a surge does not read as negative recovery.',
      ],
      constants: [
        {
          symbol: 'window',
          value: '60 s',
          why: 'Heart-rate recovery is conventionally read over one minute.',
        },
      ],
      cite: 'qyne-service/src/workouts/workout-summary.ts',
    },
    significance: {
      why: 'A faster fall is a marker of better cardiovascular fitness.',
      limits: [
        'PROVISIONAL: true recovery is measured from a held cooldown, not inferred from where a recording happened to stop.',
      ],
    },
    supply: { band: 'derived', health_connect: 'none', apple_health: 'none' },
  },
  {
    slug: 'workout-load',
    name: 'Workout training load',
    group: 'fitness',
    summary: 'A 0-100 reading of how demanding the session was.',
    unit: '0-100',
    dependsOn: { figure: 'Not finalised.', bands: 'No bands.' },
    shown: ['The "Physiological Load" bar on a workout summary.'],
    formula: {
      expression: 'provisional placeholder',
      steps: [
        'PROVISIONAL: the real load formula is not decided yet.',
        'A stable placeholder is shown per workout — the same value every time the screen opens, not a figure that changes on refresh — and the response flags it as provisional so nothing treats it as measured.',
      ],
      constants: [
        {
          symbol: 'load',
          value: 'placeholder',
          why: 'FORMULA NEEDED(WORKOUT-LOAD). Stands in until the load model is defined.',
          provisional: true,
        },
      ],
      cite: 'qyne-service/src/workouts/workout-summary.ts',
    },
    significance: {
      why: 'Will summarise session demand on one bar once the formula lands.',
      limits: ['Not a real figure yet. Do not read anything into its value.'],
    },
    supply: { band: 'derived', health_connect: 'derived', apple_health: 'derived' },
  },
  {
    slug: 'workout-laps',
    name: 'Workout laps',
    group: 'fitness',
    summary: 'Per-kilometre splits of a GPS session: time, pace and heart rate.',
    unit: 'per km',
    dependsOn: {
      figure: "The phone's GPS track, each point carrying its own time.",
      bands: 'No bands.',
    },
    shown: ['The lap table on a GPS run: distance, time, pace and HR per lap.'],
    formula: {
      expression: 'distance accumulates by great-circle; a lap closes at each 1 km',
      terms: [
        {
          name: 'segment distance',
          expression: 'haversine(point_i, point_{i+1})',
          note: 'Great-circle metres between consecutive GPS points.',
        },
        {
          name: 'kilometre time',
          expression: 't_i + (mark - cumulative) / segment x (t_{i+1} - t_i)',
          note: 'The exact moment the running total crosses a kilometre, interpolated across the segment that straddles it — so a lap lands on the kilometre, not on the next recorded point.',
        },
        {
          name: 'lap pace',
          expression: 'lap seconds / lap km',
        },
        {
          name: 'lap HR',
          expression: 'mean of the HR samples whose time falls inside the lap',
        },
      ],
      steps: [
        "Needs a time on each GPS point. GPS is event-driven and accuracy-gated, so a point's time cannot be read from its index the way a uniformly-sampled HR point's can; a track without per-point time gives distance only, and no laps.",
        'The final, partial kilometre is reported as its own lap.',
        'A GPS run with no band still has laps — pace and distance are there, the per-lap HR is empty.',
      ],
      constants: [
        {
          symbol: 'lap',
          value: '1 km',
          why: 'The split the lap list and the pace column are read in.',
        },
      ],
      cite: 'qyne-service/src/workouts/workout-summary.ts',
    },
    significance: {
      why: 'Shows how pace held or faded across a run, kilometre by kilometre.',
      limits: [
        'GPS runs only; an indoor session has no track.',
        'Accuracy follows the GPS fix quality.',
      ],
    },
    supply: { band: 'none', health_connect: 'none', apple_health: 'none' },
  },
  {
    slug: 'workout-speed-bands',
    name: 'Workout speed bands',
    group: 'fitness',
    summary: 'Time spent running fast and sprinting, from the GPS track.',
    unit: 'seconds',
    dependsOn: {
      figure: "The phone's GPS track, each point carrying its own time.",
      bands: 'Fixed speed thresholds (provisional).',
    },
    shown: ['"High speed running time" and "Sprinting time" on a GPS run.'],
    formula: {
      expression: 'segment speed = segment distance / segment time',
      terms: [
        {
          name: 'high-speed seconds',
          expression: 'sum of segment seconds where speed >= 10 km/h',
        },
        {
          name: 'sprint seconds',
          expression: 'sum of segment seconds where speed >= 18 km/h',
          note: 'A subset of high-speed: a sprinting segment counts toward both.',
        },
      ],
      steps: [
        'Each GPS segment is a pair of consecutive points; its speed is its distance over its own elapsed time.',
        'Segments too close in time to time a speed from are dropped, so a pair milliseconds apart cannot report a speed no runner reaches.',
        'Needs per-point time, like laps; without it there are no speed bands.',
      ],
      constants: [
        {
          symbol: 'high-speed',
          value: '10 km/h',
          why: 'A brisk run. PROVISIONAL running cutoff.',
          provisional: true,
        },
        {
          symbol: 'sprint',
          value: '18 km/h',
          why: 'A true sprint. PROVISIONAL running cutoff.',
          provisional: true,
        },
      ],
      cite: 'qyne-service/src/workouts/workout-summary.ts',
    },
    significance: {
      why: 'Separates easy running from the hard, fast portions of a session.',
      limits: [
        'PROVISIONAL thresholds, not yet defined per sport — FORMULA NEEDED(WORKOUT-SPEED-BANDS).',
        'GPS runs only.',
      ],
    },
    supply: { band: 'none', health_connect: 'none', apple_health: 'none' },
  },
];

/** The metrics of one group, in page order. */
export function metricsIn(group: MetricGroup): MetricDoc[] {
  return METRIC_DOCS.filter((doc) => doc.group === group);
}
