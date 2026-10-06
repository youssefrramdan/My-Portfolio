import { EyeOff, Rocket } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useOverview } from '../hooks/useOverview';
import { useSetPublished } from '../hooks/usePublish';
import { PUBLISH } from '../layout/constants';
import { displayHost } from '../lib/format';
import { adminButton } from './buttonStyles';
import ConfirmDialog from './ConfirmDialog';

/**
 * Publish control used in the topbar, the health card and the Publish status card.
 * - Unpublished: green button with a rocket; confirms first and lists unfinished setup steps (they do not block).
 * - Published: quiet "Published" with a green dot that reads "Unpublish" on hover / focus; confirms first.
 * `collapse` shows only the icon / dot below `tablet` (topbar on phones).
 */
export default function PublishButton({ label = PUBLISH.publish, size = 'md', collapse = false, className }) {
  const { data: overview } = useOverview();
  const setPublished = useSetPublished();
  const [dialog, setDialog] = useState({ open: false, publish: true });
  const [notice, setNotice] = useState('');

  if (!overview) return null;
  const { isPublished, url } = overview.site;
  const unfinished = overview.setup.items.filter((item) => !item.done && item.key !== 'published');

  const openDialog = (publish) => {
    setPublished.reset();
    setDialog({ open: true, publish });
  };

  const confirm = () =>
    setPublished.mutate(dialog.publish, {
      onSuccess: () => {
        setDialog((current) => ({ ...current, open: false }));
        setNotice(dialog.publish ? PUBLISH.publishedNotice : PUBLISH.unpublishedNotice);
      },
    });

  const copy = dialog.publish ? PUBLISH.confirmPublish : PUBLISH.confirmUnpublish;
  const collapsed = collapse && 'max-tablet:size-11 max-tablet:px-0';

  return (
    <>
      {isPublished ? (
        <button
          type="button"
          onClick={() => openDialog(false)}
          aria-label={PUBLISH.unpublishLabel}
          className={cn('group', adminButton({ variant: 'raised', size }), collapsed, className)}
        >
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full bg-fill-primary transition-colors group-hover:bg-status-error group-focus-visible:bg-status-error"
          />
          <span aria-hidden className={cn(collapse && 'max-tablet:hidden')}>
            <span className="group-hover:hidden group-focus-visible:hidden">{PUBLISH.published}</span>
            <span className="hidden group-hover:inline group-focus-visible:inline">{PUBLISH.unpublish}</span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => openDialog(true)}
          className={cn(adminButton({ size }), collapsed, className)}
        >
          <Rocket aria-hidden className="size-4.5" />
          <span className={cn(collapse && 'max-tablet:sr-only')}>{label}</span>
        </button>
      )}

      <span role="status" className="sr-only">
        {notice}
      </span>

      <ConfirmDialog
        open={dialog.open}
        onClose={() => setDialog((current) => ({ ...current, open: false }))}
        onConfirm={confirm}
        title={copy.title}
        description={dialog.publish ? copy.description(displayHost(url)) : copy.description}
        confirmLabel={dialog.publish ? PUBLISH.publish : PUBLISH.unpublish}
        pendingLabel={dialog.publish ? PUBLISH.publishing : PUBLISH.unpublishing}
        cancelLabel={PUBLISH.cancel}
        pending={setPublished.isPending}
        error={setPublished.isError ? PUBLISH.error : null}
        tone={dialog.publish ? 'primary' : 'danger'}
        icon={dialog.publish ? Rocket : EyeOff}
      >
        {dialog.publish && unfinished.length > 0 && (
          <div className="rounded-lg bg-neutral-surface-raised p-4">
            <p className="text-extra-small text-neutral-text-label">{PUBLISH.confirmPublish.unfinished}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {unfinished.map((item) => (
                <li key={item.key} className="flex items-center gap-2.5 text-small text-text-primary">
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-status-warning" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
