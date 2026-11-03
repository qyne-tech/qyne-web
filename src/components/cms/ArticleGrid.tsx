import { useState, type DragEvent } from 'react';
import { ArticleAdminCard } from './ArticleAdminCard';
import type { AdminArticle } from '../../lib/cms-api';
import { moveId } from '../../lib/article-order';
import { cn } from '../../lib/utils';

/**
 * One metric's articles in display order, as the two-column grid of the public
 * library. Reordered with each card's arrows, or by dragging its handle to
 * another card of the same metric; either way the new full order is handed to
 * `onReorder`. A drag from another metric's grid is not accepted here.
 */
export function ArticleGrid({
  articles,
  isBusy,
  onReorder,
  onEdit,
  onTogglePublished,
  onDelete,
}: {
  articles: AdminArticle[];
  isBusy: boolean;
  onReorder: (orderedIds: string[]) => void;
  onEdit: (article: AdminArticle) => void;
  onTogglePublished: (article: AdminArticle) => void;
  onDelete: (article: AdminArticle) => void;
}) {
  // Only a card whose handle is held is draggable, so text in the rest of the
  // card can still be selected and its buttons clicked.
  const [armedId, setArmedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const ids = articles.map((a) => a.id);

  const move = (from: number, to: number) => {
    const next = moveId(ids, from, to);
    if (next.some((id, i) => id !== ids[i])) onReorder(next);
  };

  const endDrag = () => {
    setArmedId(null);
    setDraggingId(null);
    setOverId(null);
  };

  const dragOver = (event: DragEvent, id: string) => {
    if (!draggingId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (overId !== id) setOverId(id);
  };

  const drop = (event: DragEvent, id: string) => {
    if (!draggingId) return;
    event.preventDefault();
    move(ids.indexOf(draggingId), ids.indexOf(id));
    endDrag();
  };

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {articles.map((article, i) => (
        <li
          key={article.id}
          draggable={!isBusy && armedId === article.id}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move';
            // Firefox starts a drag only once some data is set.
            event.dataTransfer.setData('text/plain', article.id);
            setDraggingId(article.id);
          }}
          onDragOver={(event) => dragOver(event, article.id)}
          onDrop={(event) => drop(event, article.id)}
          onDragEnd={endDrag}
          onPointerUp={() => setArmedId(null)}
          className={cn(
            'rounded-lg transition-[opacity,box-shadow] duration-150',
            draggingId === article.id && 'opacity-45',
            draggingId && overId === article.id && draggingId !== article.id &&
              'shadow-[0_0_0_1px_var(--color-primary),0_0_24px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]',
          )}
        >
          <ArticleAdminCard
            article={article}
            position={i + 1}
            isFirst={i === 0}
            isLast={i === articles.length - 1}
            isBusy={isBusy}
            onMoveEarlier={() => move(i, i - 1)}
            onMoveLater={() => move(i, i + 1)}
            onEdit={() => onEdit(article)}
            onTogglePublished={() => onTogglePublished(article)}
            onDelete={() => onDelete(article)}
            onGripDown={() => setArmedId(article.id)}
          />
        </li>
      ))}
    </ul>
  );
}
