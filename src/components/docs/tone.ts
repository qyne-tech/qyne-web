import type { Tone } from '../../data/metricDocs';

/**
 * Band colours, copied from the service's own band configs, so a band is the
 * colour here that the athlete sees in the app.
 *
 * ## Two vocabularies, on purpose
 *
 * Every scored metric is banded on a four-step SCALE — green, teal, amber,
 * red, best first, read from the good end of that metric's own range. The
 * semantic tones below it are what a band table used to pick for itself; VO2
 * max is the one figure still on them, because it has five bands and nobody
 * has decided which two of the five share a colour. The sleep stages are
 * neither: a stage is a category, not a judgement, and deep is not better
 * than REM.
 *
 * ## Why hexes and not this site's theme tokens
 *
 * The web palette and the app palette are close but not identical: the app's
 * `success` is a green (#3ddc84) and this site's primary is a lime (#9fe02f),
 * and the app's `critical` has no token here at all. Painting a band from the
 * nearest web token would make a documentation page that disagrees with the
 * screen it documents, which is the one thing it must not do.
 *
 * ## Why both halves of each pair
 *
 * The app is themed and its semantic colours are not the same value in the two
 * schemes: a green picked for a dark canvas fails contrast on a light one. The
 * service therefore sends both and lets the client pick. This site renders on
 * one dark canvas, so `toneColor` returns the dark value, and the light value
 * is kept beside it because it is half of the same decision.
 *
 * ## Drift
 *
 * The service copies these from the app's palette tokens, and there is no
 * automated check between any of the three. If the palette moves, the service
 * moves, and this file has to move with it. A mismatch shows up as a band on
 * this page whose colour differs from the same band on a detail screen.
 *
 * Source: qyne-service src/wearables/metrics/banding/band-scale.config.ts
 * (the scale) and src/wearables/metrics/band-colors.config.ts (the rest).
 */
export const BAND_TONE_COLORS: Record<Tone, { light: string; dark: string }> = {
  // The scale. `green`, `amber` and `red` are the app's `success`, `warning`
  // and `danger`; `teal` is its `datavizTeal`, whose light value design picked
  // for contrast on a light card (4.15:1, where the dark teal is 1.50:1).
  green: { light: '#1fae64', dark: '#3ddc84' },
  teal: { light: '#038565', dark: '#2fe0c6' },
  amber: { light: '#c98a1d', dark: '#f5b84e' },
  red: { light: '#d33a26', dark: '#f0553f' },
  // The semantic tones, still carried by VO2 max.
  success: { light: '#1fae64', dark: '#3ddc84' },
  warning: { light: '#c98a1d', dark: '#f5b84e' },
  danger: { light: '#d33a26', dark: '#f0553f' },
  // No palette token behind it. It was the energy scale's fourth step before
  // that scale moved onto `teal`; nothing uses it now.
  critical: { light: '#a81f0f', dark: '#c0392b' },
  neutral: { light: '#4b535c', dark: '#a7b0bc' },
  info: { light: '#3e5bd9', dark: '#5b7cfa' },
  deep_sleep: { light: '#7c5ce0', dark: '#a78bfa' },
  light_sleep: { light: '#f5b84e', dark: '#f5b84e' },
  rem: { light: '#5b7cfa', dark: '#5b7cfa' },
  awake: { light: '#2fe0c6', dark: '#2fe0c6' },
};

/** The colour for a tone on this site's canvas, which is always the dark one. */
export function toneColor(tone: Tone): string {
  return BAND_TONE_COLORS[tone].dark;
}
