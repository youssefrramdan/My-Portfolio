import { motion, useReducedMotion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from '../buttonStyles';
import ConfirmDialog from '../ConfirmDialog';
import { EYEBROW } from '../SectionCard';

/** Figma 538:9440 "Delete …": confirm, delete with the module's `remove` mutation, back to `backTo`. */
export default function ContentDeleteCard({ index, copy, title, remove, backTo }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const titleId = useId();
  const [open, setOpen] = useState(false);

  const runDelete = () => remove.mutate(undefined, { onSuccess: () => navigate(backTo, { replace: true }) });

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby={titleId}
      className="flex min-w-0 items-center justify-between gap-3 rounded-card bg-neutral-surface-0 p-5"
    >
      <h2 id={titleId} className={EYEBROW}>
        {copy.action}
      </h2>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-sm text-small font-semi-bold text-status-error underline-offset-4 transition-opacity hover:underline hover:opacity-80',
          FOCUS_RING,
        )}
      >
        <Trash2 aria-hidden className="size-4" />
        {copy.label}
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
          remove.reset();
        }}
        onConfirm={runDelete}
        title={copy.title}
        description={copy.text(title)}
        confirmLabel={copy.confirm}
        pendingLabel={copy.deleting}
        cancelLabel={copy.cancel}
        pending={remove.isPending}
        error={remove.isError ? copy.error : null}
        tone="danger"
        icon={Trash2}
      />
    </motion.section>
  );
}
