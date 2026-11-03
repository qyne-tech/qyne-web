import { useState } from 'react';
import { Button } from '../primitives/Button';
import { useModalDialog } from '../../hooks/useModalDialog';
import { CmsApiError, deleteArticle, type AdminArticle } from '../../lib/cms-api';

/**
 * Asks before deleting an article, by name. Deleting is permanent and the slug
 * is what the app and the site link to, so the warning says so.
 */
export function ConfirmDelete({
  article,
  onClose,
  onDeleted,
}: {
  article: AdminArticle;
  onClose: () => void;
  /** After a successful delete, or after finding the article already gone. */
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>();
  const dialogRef = useModalDialog(() => {
    if (!isDeleting) onClose();
  });

  const confirm = async () => {
    setIsDeleting(true);
    setError(undefined);
    try {
      await deleteArticle(article.id);
      onDeleted();
    } catch (caught) {
      if (caught instanceof CmsApiError && caught.status === 404) {
        onDeleted();
        return;
      }
      setError(caught instanceof Error ? caught.message : 'The article could not be deleted.');
      setIsDeleting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-delete-title"
      className="m-auto w-[min(480px,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-7 text-ink shadow-raised backdrop:bg-bg/75 backdrop:backdrop-blur-sm"
    >
      <span className="inline-flex items-center gap-2.5">
        <span aria-hidden className="h-px w-7 bg-danger" />
        <span className="label text-danger">Delete article</span>
      </span>
      <h2 id="confirm-delete-title" className="mt-3.5 text-[22px] leading-[1.25] font-medium">
        Delete “{article.title}”?
      </h2>
      <p className="mt-3 text-sm text-muted">
        This permanently removes the article and breaks any link to it.
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-md border border-danger/40 bg-danger/10 px-3.5 py-3 text-sm">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={confirm}
          disabled={isDeleting}
          className="bg-danger text-bg hover:bg-danger/85"
        >
          {isDeleting ? 'Deleting…' : 'Delete permanently'}
        </Button>
      </div>
    </dialog>
  );
}
