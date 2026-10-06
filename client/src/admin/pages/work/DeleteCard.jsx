import { motion, useReducedMotion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from '../../components/buttonStyles';
import ConfirmDialog from '../../components/ConfirmDialog';
import { EYEBROW } from '../../components/SectionCard';
import { useDeleteWork } from '../../hooks/useWork';
import { WORK_EDITOR, WORK_LIST, WORK_PATH } from './constants';

const COPY = WORK_EDITOR.remove;

/** Figma 538:9440 "Delete Project": confirm, delete, back to the Work list. */
export default function DeleteCard({ index, item }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const remove = useDeleteWork(item._id);
  const [open, setOpen] = useState(false);
  const title = item.work.title || WORK_LIST.untitled;

  const runDelete = () => remove.mutate(undefined, { onSuccess: () => navigate(WORK_PATH, { replace: true }) });

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby="work-delete-title"
      className="flex min-w-0 items-center justify-between gap-3 rounded-card bg-neutral-surface-0 p-5"
    >
      <h2 id="work-delete-title" className={EYEBROW}>
        {COPY.action}
      </h2>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-sm text-small font-semi-bold text-status-error transition-opacity hover:opacity-80',
          FOCUS_RING,
        )}
      >
        <Trash2 aria-hidden className="size-4" />
        {COPY.label}
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
          remove.reset();
        }}
        onConfirm={runDelete}
        title={COPY.title}
        description={COPY.text(title)}
        confirmLabel={COPY.confirm}
        pendingLabel={COPY.deleting}
        cancelLabel={COPY.cancel}
        pending={remove.isPending}
        error={remove.isError ? COPY.error : null}
        tone="danger"
        icon={Trash2}
      />
    </motion.section>
  );
}
