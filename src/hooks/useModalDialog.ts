import { useEffect, useRef, type RefObject } from 'react';

/**
 * Opens a native `<dialog>` as a modal for as long as the component is
 * mounted. The browser gives it the top layer, a backdrop, focus containment
 * and Esc; Esc is routed to `onClose` so React stays the one deciding whether
 * the dialog is shown (it may refuse while a save is in flight).
 */
export function useModalDialog(onClose: () => void): RefObject<HTMLDialogElement | null> {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      onCloseRef.current();
    };
    dialog.addEventListener('cancel', onCancel);
    if (!dialog.open) dialog.showModal();
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      if (dialog.open) dialog.close();
    };
  }, []);

  return ref;
}
