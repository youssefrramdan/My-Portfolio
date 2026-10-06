import { motion, useReducedMotion } from 'framer-motion';
import { LoaderCircle, Plus } from 'lucide-react';
import { adminEnter } from '@/lib/motion';
import { adminButton } from '../buttonStyles';

/**
 * Header card of a content list page: eyebrow, title, subtitle and the "+ New …" button. `create` is the module's
 * create mutation; `variant` follows the Figma button of that page.
 */
export default function LibraryHeader({ copy, create, onAdd, variant = 'primary' }) {
  const reduce = useReducedMotion();
  return (
    <motion.header
      variants={adminEnter(reduce)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-5 rounded-card bg-neutral-surface-0 p-5 tablet:flex-row tablet:items-center tablet:justify-between tablet:p-7"
    >
      <div className="flex flex-col gap-2">
        <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{copy.eyebrow}</p>
        <h2 className="text-h4 font-black tracking-tight text-neutral-text-heading">{copy.title}</h2>
        <p className="max-w-160 text-small text-neutral-text-label">{copy.subtitle}</p>
      </div>
      <div className="flex flex-col gap-2 tablet:items-end">
        <button
          type="button"
          onClick={onAdd}
          disabled={create.isPending}
          aria-busy={create.isPending || undefined}
          className={adminButton({ variant, className: 'self-start tablet:self-auto' })}
        >
          {create.isPending ? <LoaderCircle aria-hidden className="size-4.5 motion-safe:animate-spin" /> : <Plus aria-hidden className="size-4.5" />}
          {create.isPending ? copy.adding : copy.add}
        </button>
        {create.isError && (
          <p role="alert" className="text-extra-small text-status-error">
            {copy.addError}
          </p>
        )}
      </div>
    </motion.header>
  );
}
