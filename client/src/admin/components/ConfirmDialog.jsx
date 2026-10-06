import { LoaderCircle } from 'lucide-react';
import { useId } from 'react';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { adminButton } from './buttonStyles';

/**
 * Admin confirmation dialog on top of `Modal` (focus trap, Esc / backdrop close, focus return).
 * Focus starts on Cancel. While `pending`, nothing closes it and the confirm button shows a spinner.
 * `tone="danger"` gives the confirm button the destructive look. `children` = extra content (e.g. a list).
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel,
  pending = false,
  error,
  tone = 'primary',
  icon: Icon,
  children,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const close = () => {
    if (!pending) onClose();
  };

  return (
    <Modal open={open} onClose={close} labelledBy={titleId} describedBy={descriptionId} className="max-w-110">
      <div className="flex flex-col gap-5 rounded-card bg-neutral-surface-0 p-6 tablet:p-7">
        {Icon && (
          <span
            className={cn(
              'flex size-11 items-center justify-center rounded-tile bg-neutral-surface-raised',
              tone === 'danger' ? 'text-status-error' : 'text-text-brand',
            )}
          >
            <Icon aria-hidden className="size-5" />
          </span>
        )}
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-large font-bold text-neutral-text-heading">
            {title}
          </h2>
          <p id={descriptionId} className="text-small text-neutral-text-label">
            {description}
          </p>
        </div>
        {children}
        {error && (
          <p role="alert" className="text-small text-status-error">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 tablet:flex-row tablet:justify-end">
          <button type="button" data-autofocus onClick={close} disabled={pending} className={adminButton({ variant: 'raised' })}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            aria-busy={pending || undefined}
            className={adminButton({
              variant: tone === 'danger' ? 'raised' : 'primary',
              className: tone === 'danger' && 'text-status-error',
            })}
          >
            {pending && <LoaderCircle aria-hidden className="size-4.5 motion-safe:animate-spin" />}
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
