import { motion, useReducedMotion } from 'framer-motion';
import { CircleCheck, LoaderCircle, RotateCcw, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import HeroHeadline from '@/features/hero/HeroHeadline';
import PhotoCursor from '@/features/hero/PhotoCursor';
import { cldUrl } from '@/lib/cloudinary';
import { ctaLink } from '@/lib/cta';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton } from '../../components/buttonStyles';
import ConfirmDialog from '../../components/ConfirmDialog';
import { EYEBROW } from '../../components/SectionCard';
import { useDiscardIdentity, usePublishIdentity } from '../../hooks/useIdentity';
import { IDENTITY } from './constants';

const COPY = IDENTITY.preview;

/**
 * Figma 538:8440: the hero as it will look with the current draft (updates while typing, images rotate like on
 * the site), then the publish area: unpublished changes, "Publish changes" and "Discard" (back to the live version).
 */
export default function LivePreview({ index, control, state, saveStatus, onDiscarded }) {
  const reduce = useReducedMotion();
  const values = useWatch({ control });
  const publish = usePublishIdentity();
  const discard = useDiscardIdentity();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { changes } = state;
  const hasChanges = changes.length > 0;
  const context = { email: state.contactEmail, whatsapp: state.whatsapp, cvUrl: values.cv?.url };
  const ctas = [values.ctaPrimary, values.ctaSecondary].map((cta) => ctaLink(cta, context));
  const publishProblems = Array.isArray(publish.error?.data) ? publish.error.data : [];
  const { isSuccess: published, reset: resetPublish } = publish;

  useEffect(() => {
    if (hasChanges && published) resetPublish();
  }, [hasChanges, published, resetPublish]);

  const runDiscard = () =>
    discard.mutate(undefined, {
      onSuccess: (next) => {
        publish.reset();
        setConfirmDiscard(false);
        onDiscarded(next.identity);
      },
    });

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby="identity-preview-title"
      className="flex min-w-0 flex-col rounded-card bg-neutral-surface-0 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className={EYEBROW}>{COPY.eyebrow}</p>
          <h2 id="identity-preview-title" className="text-extra-small font-semi-bold text-neutral-text-heading">
            {COPY.title}
          </h2>
        </div>
        <span className="flex items-center gap-1.5 text-extra-small text-neutral-text-label">
          <span aria-hidden className={cn('size-1.5 rounded-full', hasChanges ? 'bg-status-warning' : 'bg-fill-primary')} />
          {hasChanges ? COPY.draft : COPY.live}
        </span>
      </div>

      <div className="relative isolate mt-4 flex flex-col items-center overflow-hidden rounded-xl bg-bg-primary px-5 pt-5 text-center">
        <span aria-hidden className="absolute top-20 -right-12 -z-10 size-48 rounded-full bg-fill-primary/6 blur-2xl" />
        {values.role && (
          <span className="rounded-full bg-neutral-surface-control px-3 py-1.5 text-extra-small text-text-brand">{values.role}</span>
        )}
        <HeroHeadline
          as="p"
          title={values.title}
          lineBreak={values.lineBreak}
          imageSlots={values.imageSlots}
          interval={values.imageInterval}
          className="mt-5 gap-x-1.5 text-h6 leading-tight"
          imageClassName="h-5 w-7 border-2"
        />
        {values.description && (
          <p className="mt-4 line-clamp-3 text-extra-small whitespace-pre-line text-neutral-text-label">{values.description}</p>
        )}
        {ctas.some(Boolean) && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {ctas.map(
              (link, position) =>
                link && (
                  <span
                    key={position}
                    className={cn(
                      'rounded-sm px-3 py-2 text-extra-small font-medium',
                      position === 0 ? 'bg-neutral-surface-control text-neutral-text-muted' : 'bg-fill-primary text-on-brand',
                    )}
                  >
                    {link.label}
                  </span>
                ),
            )}
          </div>
        )}
        <div className="relative mt-6 flex h-44 w-full items-end justify-center">
          {values.displayName && (
            <span
              aria-hidden
              className="absolute inset-x-0 top-2 text-h5 leading-none font-black break-words text-neutral-surface-3 uppercase"
            >
              {values.displayName}
            </span>
          )}
          {values.photo?.url && (
            <PhotoCursor cursor={values.photoCursor} className="relative h-full">
              <img
                src={cldUrl(values.photo.url, { width: 480 })}
                alt={values.photo.alt || COPY.portraitAlt}
                className="relative h-full w-auto object-contain object-bottom"
              />
            </PhotoCursor>
          )}
        </div>
      </div>
      <p className="mt-3 text-extra-small text-neutral-text-placeholder">{COPY.note}</p>

      <div className="mt-5 flex flex-col gap-3 border-t border-neutral-surface-control pt-5">
        {hasChanges ? (
          <>
            <p className="text-small font-semi-bold text-neutral-text-heading">{COPY.changes(changes.length)}</p>
            <ul className="flex flex-wrap gap-1.5">
              {changes.map((key) => (
                <li key={key} className="rounded-full bg-neutral-surface-raised px-2.5 py-1 text-extra-small text-neutral-text-muted">
                  {IDENTITY.fields[key] ?? key}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div role="status" className="flex items-start gap-2.5">
            <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-text-brand" />
            <div className="flex flex-col gap-0.5">
              <p className="text-small font-semi-bold text-neutral-text-heading">{publish.isSuccess ? COPY.published : COPY.upToDate}</p>
              {!publish.isSuccess && <p className="text-extra-small text-neutral-text-label">{COPY.upToDateText}</p>}
            </div>
          </div>
        )}

        {publish.isError && (
          <div role="alert" className="rounded-md bg-status-error/10 px-4 py-3 text-extra-small text-status-error">
            <p className="font-semi-bold">{publishProblems.length ? publish.error.message : COPY.publishError}</p>
            {publishProblems.length > 0 && (
              <ul className="mt-2 list-disc pl-4">
                {publishProblems.map((problem) => (
                  <li key={problem.field}>{problem.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {hasChanges && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => publish.mutate()}
              disabled={saveStatus !== 'saved' || publish.isPending}
              aria-busy={publish.isPending || undefined}
              className={adminButton({ className: 'w-full' })}
            >
              {publish.isPending ? (
                <LoaderCircle aria-hidden className="size-4.5 motion-safe:animate-spin" />
              ) : (
                <Send aria-hidden className="size-4.5" />
              )}
              {publish.isPending ? COPY.publishing : COPY.publish}
            </button>
            {saveStatus !== 'saved' && <p className="text-center text-extra-small text-neutral-text-placeholder">{COPY.waiting}</p>}
            <button
              type="button"
              onClick={() => setConfirmDiscard(true)}
              disabled={publish.isPending}
              className={adminButton({ variant: 'raised', className: 'w-full' })}
            >
              <RotateCcw aria-hidden className="size-4.5" />
              {COPY.discard}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        onClose={() => {
          setConfirmDiscard(false);
          discard.reset();
        }}
        onConfirm={runDiscard}
        title={COPY.discardTitle}
        description={COPY.discardText}
        confirmLabel={COPY.discardConfirm}
        pendingLabel={COPY.discarding}
        cancelLabel={COPY.cancel}
        pending={discard.isPending}
        error={discard.isError ? COPY.discardError : null}
        tone="danger"
        icon={RotateCcw}
      />
    </motion.section>
  );
}
