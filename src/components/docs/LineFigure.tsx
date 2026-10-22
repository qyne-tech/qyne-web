import { useId } from 'react';
import type { Figure } from '../../data/metricDocs';

/**
 * Plots a documented formula.
 *
 * The figure carries the function rather than a list of points, so the curve
 * drawn here is the arithmetic written beside it. A sampled table would be one
 * more copy of a constant to keep in step.
 *
 * Fixed viewBox, scaled by the browser: the alternative is measuring the
 * container, and a chart that needs JavaScript to have a size is a chart that
 * is blank in a print or a screenshot.
 */
const VIEW = { width: 640, height: 260 };
const PAD = { top: 14, right: 14, bottom: 34, left: 54 };
/** Enough samples that an exponential reads as a curve rather than a polyline. */
const SAMPLES = 96;

export function LineFigure({ figure }: { figure: Figure }) {
  const gradientId = useId();
  const plot = {
    left: PAD.left,
    right: VIEW.width - PAD.right,
    top: PAD.top,
    bottom: VIEW.height - PAD.bottom,
  };

  const toX = (value: number) =>
    plot.left + ((value - figure.x.min) / (figure.x.max - figure.x.min)) * (plot.right - plot.left);
  const toY = (value: number) =>
    plot.bottom -
    ((value - figure.y.min) / (figure.y.max - figure.y.min)) * (plot.bottom - plot.top);

  const points = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const x = figure.x.min + ((figure.x.max - figure.x.min) * i) / SAMPLES;
    const y = Math.min(figure.y.max, Math.max(figure.y.min, figure.fn(x)));
    return `${toX(x).toFixed(2)},${toY(y).toFixed(2)}`;
  });
  const line = `M${points.join('L')}`;
  const area = `${line}L${toX(figure.x.max).toFixed(2)},${toY(figure.y.min).toFixed(2)}L${toX(
    figure.x.min,
  ).toFixed(2)},${toY(figure.y.min).toFixed(2)}Z`;

  return (
    <figure className="mt-5 rounded-lg border border-border bg-surface p-5">
      <figcaption className="text-sm font-medium text-ink">{figure.title}</figcaption>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label={`${figure.title}. ${figure.y.label} against ${figure.x.label}.`}
        className="mt-4 w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {figure.y.ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={plot.left}
              x2={plot.right}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              x={plot.left - 10}
              y={toY(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fill="var(--color-faint)"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {tick}
            </text>
          </g>
        ))}

        {figure.x.ticks.map((tick) => (
          <text
            key={tick}
            x={toX(tick)}
            y={plot.bottom + 18}
            textAnchor="middle"
            fill="var(--color-faint)"
            fontSize="11"
            fontFamily="var(--font-mono)"
          >
            {tick}
          </text>
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="mt-1 flex items-baseline justify-between gap-4 font-mono text-[10px] tracking-wide text-faint">
        <span>{figure.y.label} (vertical)</span>
        <span>{figure.x.label}</span>
      </div>
      <p className="mt-4 border-t border-border pt-4 text-sm leading-[1.7] text-muted">
        {figure.caption}
      </p>
    </figure>
  );
}
