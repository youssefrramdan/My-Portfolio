import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, CircleCheck, LoaderCircle, PanelTop } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { headingFromTitle, headingWords, SECTION_HEADING_LIMITS as LIMITS, titleFromHeading } from '@shared/content';
import { adminEnter, ADMIN_MOTION } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { tooLong } from '../../lib/contentItems';
import { adminButton, FOCUS_RING } from '../buttonStyles';
import ErrorState from '../ErrorState';
import FormField, { TextArea, TextInput } from '../FormField';
import Skeleton from '../Skeleton';

const text = (max) => z.string().trim().max(max, tooLong(max));

/**
 * "Main Details" (collapsible, Figma 544:10339): the home section heading of a content module. Eyebrow, one-line
 * title whose last words can be highlighted in green (word chips), optional subtitle, plus the module's `extras`
 * (`[{ name, copy, max, required, multiline }]`). Saved with a button, straight to the site (no draft).
 * `query` / `save` are the module's section query and mutation.
 */
export default function MainDetailsCard({ index, idPrefix, copy, query, save, extras = [] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { data, isPending, isError, isFetching, refetch } = query;

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      className="flex min-w-0 flex-col rounded-card bg-neutral-surface-0"
    >
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className={cn('flex w-full items-center gap-4 rounded-card p-5 text-left tablet:px-7', FOCUS_RING)}
        >
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-text-brand">
            <PanelTop className="size-4.5" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-large font-bold text-neutral-text-heading">{copy.title}</span>
            <span className="text-extra-small font-regular text-neutral-text-label">{copy.description}</span>
          </span>
          <ChevronDown
            aria-hidden
            className={cn('size-5 shrink-0 text-neutral-text-label transition-transform duration-300', open && 'rotate-180')}
          />
        </button>
      </h2>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: ADMIN_MOTION.fade }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 tablet:px-7 tablet:pb-7">
              {isPending ? (
                <Skeleton className="h-64 rounded-lg" />
              ) : isError ? (
                <ErrorState title={copy.loadError} retryLabel={copy.retry} onRetry={() => refetch()} retrying={isFetching} />
              ) : (
                <HeadingForm idPrefix={idPrefix} copy={copy} section={data} save={save} extras={extras} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

const buildSchema = (extras, copy) =>
  z.object({
    badge: text(LIMITS.badge),
    heading: text(LIMITS.title).min(1, `${copy.heading.label} is required`),
    highlightCount: z.number().int().min(0),
    description: text(LIMITS.description),
    ...Object.fromEntries(
      extras.map((field) => [field.name, field.required ? text(field.max).min(1, `${field.copy.label} is required`) : text(field.max)]),
    ),
  });

function toForm(section = {}, extras) {
  const { text: heading, highlightCount } = headingFromTitle(section?.title);
  return {
    badge: section?.badge ?? '',
    heading,
    highlightCount,
    description: section?.description ?? '',
    ...Object.fromEntries(extras.map((field) => [field.name, section?.[field.name] ?? ''])),
  };
}

const toPayload = ({ heading, highlightCount, ...rest }) => ({ ...rest, title: titleFromHeading(heading, highlightCount) });

function HeadingForm({ idPrefix, copy, section, save, extras }) {
  const [schema] = useState(() => buildSchema(extras, copy));
  const form = useForm({ resolver: zodResolver(schema), defaultValues: toForm(section, extras), mode: 'onChange' });
  const { register, control, handleSubmit, formState, reset, setValue } = form;
  const { errors, isDirty } = formState;
  const values = useWatch({ control });
  const { isSuccess, reset: resetSave } = save;

  useEffect(() => {
    if (isDirty && isSuccess) resetSave();
  }, [isDirty, isSuccess, resetSave]);

  const submit = handleSubmit((next) => save.mutate(toPayload(next), { onSuccess: (saved) => reset(toForm(saved, extras)) }));

  const field = (name, fieldCopy, { max, multiline, required = false } = {}) => {
    const Control = multiline ? TextArea : TextInput;
    return (
      <FormField
        id={`${idPrefix}-${name}`}
        label={fieldCopy.label}
        required={required}
        optional={fieldCopy.optional}
        hint={fieldCopy.hint}
        error={errors[name]?.message}
        count={(values[name] ?? '').length}
        max={max}
      >
        {(aria) => <Control {...aria} {...(multiline ? {} : { size: 'sm' })} placeholder={fieldCopy.placeholder} {...register(name)} />}
      </FormField>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 border-t border-neutral-surface-control pt-6">
      {field('badge', copy.badge, { max: LIMITS.badge })}
      <div className="flex flex-col gap-3">
        {field('heading', copy.heading, { max: LIMITS.title, required: true })}
        <HighlightPicker
          copy={copy.highlight}
          words={headingWords(values.heading)}
          count={values.highlightCount ?? 0}
          onChange={(next) => setValue('highlightCount', next, { shouldDirty: true, shouldValidate: true })}
        />
      </div>
      {field('description', copy.subtitle, { max: LIMITS.description, multiline: true })}
      {extras.length > 0 && (
        <div className="grid gap-5 tablet:grid-cols-2">
          {extras.map((extra) => (
            <div key={extra.name} className={cn(extra.multiline && 'tablet:col-span-2')}>
              {field(extra.name, extra.copy, extra)}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-end">
        {save.isSuccess && (
          <p role="status" className="flex items-center gap-2 text-extra-small text-text-brand tablet:mr-auto">
            <CircleCheck aria-hidden className="size-4" />
            {copy.saved}
          </p>
        )}
        {save.isError && (
          <p role="alert" className="text-extra-small text-status-error tablet:mr-auto">
            {save.error?.message || copy.saveError}
          </p>
        )}
        <button type="submit" disabled={!isDirty || save.isPending} aria-busy={save.isPending || undefined} className={adminButton({ size: 'sm' })}>
          {save.isPending && <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />}
          {save.isPending ? copy.saving : copy.save}
        </button>
      </div>
    </form>
  );
}

/**
 * "Highlight:" word chips. The highlight always runs to the end of the title: clicking a word starts it there,
 * clicking its first word again removes it.
 */
function HighlightPicker({ copy, words, count, onChange }) {
  const shown = Math.min(count, words.length);
  const start = words.length - shown;
  if (!words.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label={copy.label} className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-extra-small font-semi-bold text-neutral-text-muted">{copy.label}</span>
        {words.map((word, position) => {
          const on = shown > 0 && position >= start;
          return (
            <button
              // Words repeat, so the position is part of the key.
              key={`${word}-${position}`}
              type="button"
              aria-pressed={on}
              aria-label={copy.word(word, on)}
              onClick={() => onChange(on && position === start ? 0 : words.length - position)}
              className={cn(
                'rounded-full px-2.5 py-1 text-extra-small font-semi-bold transition-colors',
                on ? 'bg-fill-primary/15 text-text-brand' : 'bg-neutral-surface-raised text-neutral-text-muted hover:text-text-primary',
                FOCUS_RING,
              )}
            >
              {word}
            </button>
          );
        })}
      </div>
      <p className="text-extra-small text-neutral-text-placeholder">{copy.hint}</p>
    </div>
  );
}
