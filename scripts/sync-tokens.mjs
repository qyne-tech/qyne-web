#!/usr/bin/env node
/**
 * Sync the colour block in src/styles/theme.css from qyne-app's design-kit
 * palette (packages/tokens/src/palettes.ts), which is where design's Figma
 * values live for every QYNE app.
 *
 * This repo is separate from the qyne-app monorepo and installs with npm, so it
 * can't depend on @qyne/tokens as a workspace package. Instead of hand-copying
 * the values (which is how native, web and this site ended up with three
 * different palettes), the colours are derived mechanically and CI fails if the
 * two ever disagree.
 *
 *   npm run tokens:sync    rewrite the colour block from the palette
 *   npm run tokens:check   fail if theme.css doesn't match the palette
 *
 * The palette is read from a local qyne-app checkout. Point QYNE_APP_PATH at it
 * if it isn't the default sibling directory.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const THEME = resolve(root, 'src/styles/theme.css');
const APP = process.env.QYNE_APP_PATH ?? resolve(root, '../qyne-app');
const PALETTE = resolve(APP, 'packages/tokens/src/palettes.ts');

const BEGIN = '  /* >>> tokens:sync — generated from qyne-app palettes.ts, do not edit by hand */';
const END = '  /* <<< tokens:sync */';

/**
 * This site's colour variables, mapped onto the design kit's semantic names.
 *
 * Note `accent`: here it means the sleep/biometric accent (a violet), which is
 * the kit's `biometric` — NOT the kit's `accent`, which is an alias of the lime
 * brand colour. Mapping it by name would turn every biometric accent lime.
 */
const MAP = [
  ['bg', 'background', 'page background (deepest)'],
  ['surface', 'surface', 'cards, panels'],
  ['surface-2', 'surfaceHigh', 'raised / inset elements, inputs'],
  ['border', 'border', 'hairline borders, dividers, grid'],
  ['ink', 'textPrimary', 'primary text'],
  ['muted', 'textSecondary', 'secondary text'],
  ['faint', 'textTertiary', 'tertiary / labels'],
  ['primary', 'primary', 'recovery / ready / "go"'],
  ['primary-light', 'primaryLight', 'primary hover / emphasis'],
  ['primary-bg', 'primaryBg', 'tinted background behind primary'],
  ['warning', 'warning', 'caution / moderate load'],
  ['danger', 'danger', 'risk / overload / "stop"'],
  ['info', 'info', 'analytical / neutral data'],
  ['accent', 'biometric', 'sleep / biometric / secondary accent'],
];

/** Pull the `dark` palette out of palettes.ts without importing TypeScript. */
function readDarkPalette() {
  let src;
  try {
    src = readFileSync(PALETTE, 'utf8');
  } catch {
    console.error(
      `Could not read the design-kit palette at:\n  ${PALETTE}\n\n` +
        'Clone qyne-app next to this repo, or set QYNE_APP_PATH to point at it.',
    );
    process.exit(2);
  }
  const block = src.match(/const dark: Palette = \{([\s\S]*?)\n\};/);
  if (!block) {
    console.error(`Could not find the \`dark\` palette in ${PALETTE}.`);
    process.exit(2);
  }
  const palette = {};
  for (const [, key, value] of block[1].matchAll(/^\s*([A-Za-z0-9]+):\s*'(#[0-9a-fA-F]{3,8})'/gm)) {
    palette[key] = value.toLowerCase();
  }
  return palette;
}

/** Relative luminance / contrast, so the ratios in the comments stay honest. */
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

function buildBlock(palette) {
  const missing = MAP.filter(([, kitKey]) => !palette[kitKey]).map(([, k]) => k);
  if (missing.length) {
    console.error(`Palette is missing expected keys: ${missing.join(', ')}`);
    process.exit(2);
  }

  const bg = palette.background;
  const lines = MAP.map(([cssName, kitKey, note]) => {
    const value = palette[kitKey];
    const ratio = contrast(value, bg);
    // Contrast is only meaningful for things drawn as text on the canvas.
    const showRatio = ['ink', 'muted', 'faint'].includes(cssName);
    const comment = showRatio ? `${note} — ${ratio.toFixed(1)}:1 on --color-bg` : note;
    return `  --color-${cssName}: ${value}; /* ${comment} */`;
  });

  return [
    BEGIN,
    `  /* Source: qyne-app packages/tokens/src/palettes.ts (dark). Run \`npm run tokens:sync\`. */`,
    ...lines,
    END,
  ].join('\n');
}

const check = process.argv.includes('--check');
const palette = readDarkPalette();
const generated = buildBlock(palette);
const current = readFileSync(THEME, 'utf8');

const region = new RegExp(
  `${BEGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
);
if (!region.test(current)) {
  console.error(
    'Could not find the tokens:sync markers in src/styles/theme.css.\n' +
      'The generated colour block must stay wrapped in them.',
  );
  process.exit(2);
}

const next = current.replace(region, generated);

if (check) {
  if (next !== current) {
    console.error(
      'theme.css colours are out of sync with qyne-app\'s design kit.\n' +
        'Run `npm run tokens:sync` and commit the result.',
    );
    process.exit(1);
  }
  console.log('theme.css colours match the design kit.');
} else if (next === current) {
  console.log('theme.css colours already match the design kit.');
} else {
  writeFileSync(THEME, next);
  console.log('Updated theme.css colours from the design kit.');
}
