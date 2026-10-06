import { motion, useReducedMotion } from 'framer-motion';
import { Check, EyeOff, MessageSquarePlus, Pencil, Plus, Quote, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cldUrl } from '@/lib/cloudinary';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import ConfirmDialog from '../../components/ConfirmDialog';
import LetterTile from '../../components/content/LetterTile';
import LibraryHeader from '../../components/content/LibraryHeader';
import MainDetailsCard from '../../components/content/MainDetailsCard';
import StatusBadge from '../../components/content/StatusBadge';
import ErrorState from '../../components/ErrorState';
import { EYEBROW } from '../../components/SectionCard';
import Skeleton from '../../components/Skeleton';
import {
  useCreateTestimonial,
  useDeleteTestimonial,
  usePublishTestimonial,
  useSaveTestimonialsSection,
  useTestimonialList,
  useTestimonialsSection,
  useUnpublishTestimonial,
} from '../../hooks/useTestimonialsAdmin';
import { SECTION_EXTRAS, SECTION_FORM, SOURCE_LABELS, TESTIMONIALS_LIST as COPY, testimonialEditPath } from './constants';

const ACTIONS = COPY.actions;

/** `/admin/content/testimonials` (Figma 544:10947): section heading + invite, then the testimonials as cards. */
export default function TestimonialsListPage() {
  const navigate = useNavigate();
  const create = useCreateTestimonial();
  const section = useTestimonialsSection();
  const saveSection = useSaveTestimonialsSection();
  const addTestimonial = () => create.mutate(undefined, { onSuccess: (item) => navigate(testimonialEditPath(item._id)) });

  return (
    <div className="flex flex-col gap-5">
      <LibraryHeader copy={COPY} create={create} onAdd={addTestimonial} />
      <MainDetailsCard
        index={1}
        idPrefix="testimonials-section"
        copy={SECTION_FORM}
        query={section}
        save={saveSection}
        extras={SECTION_EXTRAS}
      />
      <TestimonialLibrary index={2} onAdd={addTestimonial} adding={create.isPending} />
    </div>
  );
}

function TestimonialLibrary({ index, onAdd, adding }) {
  const reduce = useReducedMotion();
  const { data: items, isPending, isError, isFetching, refetch } = useTestimonialList();
  const list = items ?? [];
  const pending = list.filter((item) => item.status === 'pending').length;

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby="testimonials-library-title"
      className="flex min-w-0 flex-col gap-5 rounded-card bg-neutral-surface-0 p-5 tablet:p-7"
    >
      <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
        <h2 id="testimonials-library-title" className={EYEBROW}>
          {COPY.library}
          {items && <span className="ml-2 text-neutral-text-placeholder normal-case">{COPY.results(list.length)}</span>}
        </h2>
        {pending > 0 && (
          <p className="self-start rounded-full bg-status-warning/10 px-2.5 py-1 text-extra-small font-semi-bold text-status-warning tablet:self-auto">
            {COPY.pending(pending)}
          </p>
        )}
      </div>

      {isPending ? (
        <div className="grid gap-3 tablet:grid-cols-2">
          {Array.from({ length: 4 }, (_, position) => (
            <Skeleton key={position} className="h-56 rounded-tile" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title={COPY.error.title} message={COPY.error.message} retryLabel={COPY.error.retry} onRetry={() => refetch()} retrying={isFetching} />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-neutral-surface-raised px-6 py-12 text-center">
          <span aria-hidden className="flex size-12 items-center justify-center rounded-tile bg-neutral-surface-control text-text-brand">
            <MessageSquarePlus className="size-5" />
          </span>
          <p className="text-small font-semi-bold text-neutral-text-heading">{COPY.empty.title}</p>
          <p className="max-w-80 text-extra-small text-neutral-text-label">{COPY.empty.text}</p>
          <button type="button" onClick={onAdd} disabled={adding} className={adminButton({ size: 'sm', className: 'mt-2' })}>
            <Plus aria-hidden className="size-4" />
            {COPY.add}
          </button>
        </div>
      ) : (
        <ul className="grid gap-3 tablet:grid-cols-2">
          {list.map((item) => (
            <TestimonialCard key={item._id} item={item} />
          ))}
        </ul>
      )}
    </motion.section>
  );
}

/**
 * One testimonial: quote, person, Visitor / Admin tag, and the quick actions. Pending ones are approved (= published)
 * or rejected (= deleted); the others are published / moved to draft / deleted.
 */
function TestimonialCard({ item }) {
  const { content } = item;
  const name = content.name || COPY.untitled;
  const isPending = item.status === 'pending';
  const publish = usePublishTestimonial(item._id);
  const unpublish = useUnpublishTestimonial(item._id);
  const remove = useDeleteTestimonial(item._id);
  const [confirming, setConfirming] = useState(false);
  const confirm = isPending ? COPY.confirmReject : COPY.confirmDelete;
  const busy = publish.isPending || unpublish.isPending;
  const failed = publish.isError || unpublish.isError;

  const close = () => {
    setConfirming(false);
    remove.reset();
  };

  return (
    <li className="flex min-w-0 flex-col gap-4 rounded-tile bg-neutral-surface-raised p-5">
      <div className="flex items-center gap-2">
        <Quote aria-hidden className="size-5 shrink-0 fill-current text-text-brand" />
        <StatusBadge item={item} />
        <Link
          to={testimonialEditPath(item._id)}
          aria-label={COPY.edit(name)}
          className={adminButton({ variant: 'secondary', size: 'icon', className: 'ml-auto size-9' })}
        >
          <Pencil aria-hidden className="size-4" />
        </Link>
      </div>

      <p className={cn('line-clamp-4 flex-1 text-small', content.message ? 'text-neutral-text-muted' : 'text-neutral-text-placeholder')}>
        {content.message ? `“${content.message}”` : COPY.noQuote}
      </p>

      <div className="flex min-w-0 items-center gap-3">
        {content.avatar?.url ? (
          <img src={cldUrl(content.avatar.url, { width: 96 })} alt="" className="size-10 shrink-0 rounded-full object-cover" />
        ) : (
          <LetterTile text={content.name} className="size-10 rounded-full" />
        )}
        <span className="flex min-w-0 flex-1 flex-col">
          <Link
            to={testimonialEditPath(item._id)}
            className={cn('truncate rounded-sm text-small font-semi-bold text-text-primary hover:text-text-brand', FOCUS_RING)}
          >
            {name}
          </Link>
          {content.role && <span className="truncate text-extra-small text-neutral-text-label">{content.role}</span>}
        </span>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-extra-small font-semi-bold',
            item.source === 'visitor' ? 'bg-fill-primary/10 text-text-brand' : 'bg-neutral-surface-control text-neutral-text-muted',
          )}
        >
          <span className="sr-only">{COPY.sourceLabel(item.source)}</span>
          <span aria-hidden>{SOURCE_LABELS[item.source]}</span>
        </span>
      </div>

      <div className="flex gap-2 border-t border-neutral-surface-control pt-4">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={adminButton({ variant: 'secondary', size: 'sm', className: 'flex-1 hover:text-status-error' })}
        >
          {isPending ? <X aria-hidden className="size-4" /> : <Trash2 aria-hidden className="size-4" />}
          {isPending ? ACTIONS.reject : ACTIONS.delete}
        </button>
        {item.isLive ? (
          <button
            type="button"
            onClick={() => unpublish.mutate()}
            disabled={busy}
            aria-busy={unpublish.isPending || undefined}
            className={adminButton({ variant: 'raised', size: 'sm', className: 'flex-1' })}
          >
            <EyeOff aria-hidden className="size-4" />
            {unpublish.isPending ? ACTIONS.moving : ACTIONS.draft}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => publish.mutate()}
            disabled={busy}
            aria-busy={publish.isPending || undefined}
            className={adminButton({ size: 'sm', className: 'flex-1' })}
          >
            {isPending ? <Check aria-hidden className="size-4" /> : <Send aria-hidden className="size-4" />}
            {isPending
              ? publish.isPending
                ? ACTIONS.approving
                : ACTIONS.approve
              : publish.isPending
                ? ACTIONS.publishing
                : ACTIONS.publish}
          </button>
        )}
      </div>
      {failed && (
        <p role="alert" className="text-extra-small text-status-error">
          {publish.error?.message || ACTIONS.error}
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={close}
        onConfirm={() => remove.mutate(undefined, { onSuccess: () => setConfirming(false) })}
        title={confirm.title}
        description={confirm.text(name)}
        confirmLabel={confirm.confirm}
        pendingLabel={COPY.deleting}
        cancelLabel={COPY.cancel}
        pending={remove.isPending}
        error={remove.isError ? COPY.deleteError : null}
        tone="danger"
        icon={Trash2}
      />
    </li>
  );
}
