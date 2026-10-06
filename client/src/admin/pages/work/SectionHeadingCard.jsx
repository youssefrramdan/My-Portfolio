import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, CircleCheck, LoaderCircle, PanelTop, Plus, Trash2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { DEFAULT_PAGE_BUTTONS, MAX_PAGE_BUTTONS } from '@shared/work';
import { adminEnter, ADMIN_MOTION } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import CtaEditor from '../../components/CtaEditor';
import ErrorState from '../../components/ErrorState';
import FormField, { TextArea, TextInput } from '../../components/FormField';
import Skeleton from '../../components/Skeleton';
import { useContactState } from '../../hooks/useContactAdmin';
import { useProjectsSection, useSaveProjectsSection } from '../../hooks/useWork';
import { ctaSchema, emptyCta } from '../../lib/cta';
import { SECTION_FORM as COPY, WORK_EDITOR } from './constants';

const { limits: LIMITS } = COPY;
const tooLong = WORK_EDITOR.validation.tooLong;
const text = (max) => z.string().trim().max(max, tooLong(max));
const required = (max, label) => text(max).min(1, `${label} is required`);

const sectionSchema = z.object({
  badge: required(LIMITS.badge, COPY.badge.label),
  title: z.object({ plain: required(LIMITS.plain, COPY.plain.label), highlight: text(LIMITS.highlight) }),
  description: text(LIMITS.description),
  scrollButtonLabel: text(LIMITS.scrollButtonLabel),
  cardCtaLabel: required(LIMITS.cardCtaLabel, COPY.cardCtaLabel.label),
  pageButtons: z.array(ctaSchema({ required: true })).max(MAX_PAGE_BUTTONS),
});

const toForm = (section = {}) => ({
  badge: section.badge ?? '',
  title: { plain: section.title?.plain ?? '', highlight: section.title?.highlight ?? '' },
  description: section.description ?? '',
  scrollButtonLabel: section.scrollButtonLabel ?? '',
  cardCtaLabel: section.cardCtaLabel ?? '',
  pageButtons: (section.pageButtons ?? DEFAULT_PAGE_BUTTONS).map((button) => ({ ...emptyCta(), ...button, target: button.target ?? '' })),
});

/**
 * "Main Details" (collapsible): the "Selected Projects" heading on the home page and the buttons of every project
 * page. Saved with a button, straight to the site (it has no draft).
 */
export default function SectionHeadingCard({ index }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { data, isPending, isError, isFetching, refetch } = useProjectsSection();

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
            <span className="text-large font-bold text-neutral-text-heading">{COPY.title}</span>
            <span className="text-extra-small font-regular text-neutral-text-label">{COPY.description}</span>
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
                <ErrorState title={COPY.loadError} retryLabel={COPY.retry} onRetry={() => refetch()} retrying={isFetching} />
              ) : (
                <HeadingForm section={data} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function HeadingForm({ section }) {
  const save = useSaveProjectsSection();
  const form = useForm({ resolver: zodResolver(sectionSchema), defaultValues: toForm(section), mode: 'onChange' });
  const { register, control, handleSubmit, formState, reset } = form;
  const { errors, isDirty } = formState;
  const values = useWatch({ control });
  const { isSuccess, reset: resetSave } = save;

  useEffect(() => {
    if (isDirty && isSuccess) resetSave();
  }, [isDirty, isSuccess, resetSave]);

  const submit = handleSubmit((next) =>
    save.mutate(next, { onSuccess: (saved) => reset(toForm(saved)) }),
  );

  const field = (name, copy, { max, multiline, error } = {}) => {
    const Control = multiline ? TextArea : TextInput;
    const value = name.split('.').reduce((current, key) => current?.[key], values) ?? '';
    return (
      <FormField
        id={`projects-section-${name.replace('.', '-')}`}
        label={copy.label}
        required={!copy.optional}
        optional={copy.optional}
        hint={copy.hint}
        error={error?.message}
        count={value.length}
        max={max}
      >
        {(aria) => <Control {...aria} {...(multiline ? {} : { size: 'sm' })} placeholder={copy.placeholder} {...register(name)} />}
      </FormField>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 border-t border-neutral-surface-control pt-6">
      <div className="grid gap-5 tablet:grid-cols-2">
        {field('badge', COPY.badge, { max: LIMITS.badge, error: errors.badge })}
        {field('cardCtaLabel', COPY.cardCtaLabel, { max: LIMITS.cardCtaLabel, error: errors.cardCtaLabel })}
        {field('title.plain', COPY.plain, { max: LIMITS.plain, error: errors.title?.plain })}
        {field('title.highlight', COPY.highlight, { max: LIMITS.highlight, error: errors.title?.highlight })}
      </div>
      {field('description', COPY.sectionDescription, { max: LIMITS.description, multiline: true, error: errors.description })}
      {field('scrollButtonLabel', COPY.scrollButtonLabel, { max: LIMITS.scrollButtonLabel, error: errors.scrollButtonLabel })}

      <FormProvider {...form}>
        <PageButtons />
      </FormProvider>

      <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-end">
        {save.isSuccess && (
          <p role="status" className="flex items-center gap-2 text-extra-small text-text-brand tablet:mr-auto">
            <CircleCheck aria-hidden className="size-4" />
            {COPY.saved}
          </p>
        )}
        {save.isError && (
          <p role="alert" className="text-extra-small text-status-error tablet:mr-auto">
            {save.error?.message || COPY.saveError}
          </p>
        )}
        <button
          type="submit"
          disabled={!isDirty || save.isPending}
          aria-busy={save.isPending || undefined}
          className={adminButton({ size: 'sm' })}
        >
          {save.isPending && <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />}
          {save.isPending ? COPY.saving : COPY.save}
        </button>
      </div>
    </form>
  );
}

/** The floating buttons of every project page; the notes use the Contact page email / WhatsApp and the CV. */
function PageButtons() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'pageButtons' });
  const { data: contact } = useContactState();
  const copy = COPY.pageButtons;
  const full = fields.length >= MAX_PAGE_BUTTONS;

  return (
    <div className="flex flex-col gap-4 border-t border-neutral-surface-control pt-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-small font-semi-bold text-neutral-text-heading">{copy.title}</p>
          <p className="text-extra-small text-neutral-text-label">{copy.text}</p>
        </div>
        <button
          type="button"
          onClick={() => append({ label: '', action: 'whatsapp', target: '' })}
          disabled={full}
          className={adminButton({ variant: 'secondary', size: 'sm', className: 'shrink-0' })}
        >
          <Plus aria-hidden className="size-4" />
          {copy.add}
        </button>
      </div>
      {fields.length === 0 ? (
        <p className="rounded-lg bg-neutral-surface-raised px-4 py-5 text-center text-extra-small text-neutral-text-label">{copy.empty}</p>
      ) : (
        <div className="grid gap-4 tablet:grid-cols-2 xl:grid-cols-3">
          {fields.map((field, position) => (
            <div key={field.id} className="relative">
              <CtaEditor
                name={`pageButtons.${position}`}
                heading={copy.button(position + 1)}
                idPrefix="projects-section"
                copy={copy}
                sections={contact?.sections ?? []}
                contactEmail={contact?.contactEmail}
                whatsapp={contact?.whatsapp}
                hasCv={contact?.hasCv}
              />
              <button
                type="button"
                onClick={() => remove(position)}
                aria-label={copy.remove(position + 1)}
                className={adminButton({ variant: 'secondary', size: 'icon', className: 'absolute top-3 right-3 size-8 hover:text-status-error' })}
              >
                <Trash2 aria-hidden className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
