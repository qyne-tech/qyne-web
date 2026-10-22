import type { Tone } from '../../data/metricDocs';

/**
 * Band colours, copied from the service's own band-colour config, so a band is
 * the colour here that the athlete sees in the app.
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
 * Source: qyne-service src/wearables/metrics/band-colors.config.ts
 */
export const BAND_TONE_COLORS: Record<Tone, { light: string; dark: string }> = {
  success: { light: '#1fae64', dark: '#3ddc84' },
  warning: { light: '#c98a1d', dark: '#f5b84e' },
  danger: { light: '#d33a26', dark: '#f0553f' },
  // No palette token behind it: the palette carries three semantic colours and
  // the energy scale needs a fourth step. Flagged in the service as needing
  // design sign-off, and better than making two bands indistinguishable.
  critical: { light: '#a81f0f', dark: '#c0392b' },
  // A band that is neither good nor bad. Strain's "Moderate" is the case: an
  // ordinary day is not a warning, and painting it amber said it was.
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
