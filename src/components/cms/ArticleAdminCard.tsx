import type { PointerEvent, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, GripVertical } from 'lucide-react';
import { Card } from '../primitives/Card';
import type { AdminArticle } from '../../lib/cms-api';
import { cn } from '../../lib/utils';

/**
 * One article in the CMS: the public library's card, plus its state and the
 * admin's actions. The order reads left to right, then down, so "earlier" is
 * ← and "later" is →.
 */
export function ArticleAdminCard({
  article,
  position,
  isFirst,
  isLast,
  isBusy,
  onMoveEarlier,
  onMoveLater,
  onEdit,
  onTogglePublished,
  onDelete,
  onGripDown,
}: {
  article: AdminArticle;
  /** 1-based place in its metric's list. */
  position: number;
  isFirst: boolean;
  isLast: boolean;
  /** A write is in flight; every action waits for it. */
  isBusy: boolean;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onEdit: () => void;
  onTogglePublished: () => void;
  onDelete: () => void;
  /** Pressing the handle is what makes the card draggable. */
  onGripDown: (event: PointerEvent) => void;
}) {
  return (
    <Card interactive={false} className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h3 text-ink">{article.title}</h3>
          <span
            aria-hidden
            title="Drag to reorder"
            onPointerDown={onGripDown}
            className="-mr-1 mt-0.5 shrink-0 cursor-grab rounded p-1 text-faint transition-colors hover:bg-surface-2 hover:text-muted active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              'rounded-sm px-1.5 py-0.5 font-mono text-[10.5px] font-medium tracking-[0.08em] uppercase',
              article.published ? 'bg-primary-bg text-primary' : 'bg-surface-2 text-muted',
            )}
          >
            {article.published ? 'Published' : 'Draft'}
          </span>
          <span className="font-mono text-xs text-faint">
            {article.source} · {article.readMinutes} min read
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-border px-5 py-2.5 text-[13px]">
        <span className="font-mono text-xs font-medium tracking-[0.04em] text-faint">
          {String(position).padStart(2, '0')}
        </span>
        <div className="flex gap-1">
          <MoveButton label="Move earlier" disabled={isBusy || isFirst} onClick={onMoveEarlier}>
            <ArrowLeft aria-hidden className="size-3.5" />
          </MoveButton>
          <MoveButton label="Move later" disabled={isBusy || isLast} onClick={onMoveLater}>
            <ArrowRight aria-hidden className="size-3.5" />
          </MoveButton>
        </div>
        <span aria-hidden className="h-4 w-px bg-border" />
        <ActionButton disabled={isBusy} onClick={onEdit}>
          Edit
        </ActionButton>
        <ActionButton disabled={isBusy} onClick={onTogglePublished}>
          {article.published ? 'Unpublish' : 'Publish'}
        </ActionButton>
        <ActionButton disabled={isBusy} onClick={onDelete} className="ml-auto text-danger hover:text-danger">
          Delete
        </ActionButton>
      </div>
    </Card>
  );
}

function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-[26px] place-items-center rounded-sm border border-border text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function ActionButton({
  disabled,
  onClick,
  className,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'text-muted transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
