import { X } from 'lucide-react';
import { useState } from 'react';
import { SITE_STATUS_TEXT } from './labels';

/** Reminds the logged-in admin that visitors cannot see this yet. Dismissed until the next page load. */
export default function PreviewPill() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-neutral-surface-2/90 py-1.5 pr-1.5 pl-4 text-small whitespace-nowrap text-text-primary shadow-2xl shadow-bg-primary backdrop-blur-glass">
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-status-warning" />
      <p role="status">{SITE_STATUS_TEXT.preview}</p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label={SITE_STATUS_TEXT.dismissPreview}
        className="flex size-8 items-center justify-center rounded-full text-text-secondary transition-colors outline-none hover:bg-neutral-surface-3 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-fill-primary"
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}
