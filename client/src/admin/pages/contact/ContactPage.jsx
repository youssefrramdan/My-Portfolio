import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Plus, Trash2 } from 'lucide-react';
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import { EMAIL_PATTERN, MAX_SOCIALS, MIN_SOCIALS, PLATFORM_KEYS, SOCIAL_PLATFORMS, CONTACT_LIMITS as LIMITS } from '@shared/contact';
import { WHATSAPP_NUMBER } from '@shared/identity';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton } from '../../components/buttonStyles';
import { EDITOR_GRID } from '../../components/content/ContentEditorFrame';
import { SaveState } from '../../components/content/ContentEditorHeader';
import EditorHint from '../../components/content/EditorHint';
import MainDetailsCard from '../../components/content/MainDetailsCard';
import CtaEditor from '../../components/CtaEditor';
import ErrorState from '../../components/ErrorState';
import FormField, { SelectInput, TextInput } from '../../components/FormField';
import SectionCard, { EYEBROW } from '../../components/SectionCard';
import Skeleton from '../../components/Skeleton';
import SortableList, { SortableRow } from '../../components/SortableList';
import { useAutosave } from '../../hooks/useAutosave';
import { useContactSection, useContactState, useSaveContact, useSaveContactSection } from '../../hooks/useContactAdmin';
import { isUrlLike } from '../../lib/contentItems';
import { CONTACT as COPY, SECTION_FORM } from './constants';
import { contactSchema, newSocial, toForm, toPayload } from './contactForm';

/** `/admin/content/contact` (Figma 544:11559): heading, email, social channels and buttons. Autosaves to the site. */
export default function ContactPage() {
  const { data, isPending, isError, isFetching, refetch } = useContactState();

  if (isPending) {
    return (
      <div role="status" className="flex flex-col gap-5">
        <Skeleton className="h-36 rounded-card" />
        <Skeleton className="h-20 rounded-card" />
        <div className={EDITOR_GRID}>
          <Skeleton className="h-120 rounded-card" />
          <Skeleton className="h-64 rounded-card" />
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <ErrorState
        title={COPY.loadError.title}
        message={COPY.loadError.message}
        retryLabel={COPY.loadError.retry}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }
  return <ContactEditor state={data} />;
}

function ContactEditor({ state }) {
  const reduce = useReducedMotion();
  const form = useForm({ defaultValues: toForm(state), resolver: zodResolver(contactSchema), mode: 'onChange' });
  const { mutateAsync } = useSaveContact();
  const autosave = useAutosave({ form, schema: contactSchema, toPayload, save: mutateAsync, leaveWarning: COPY.save.leaveWarning });
  const section = useContactSection();
  const saveSection = useSaveContactSection();

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-5">
        <motion.header
          variants={adminEnter(reduce)}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5 rounded-card bg-neutral-surface-0 p-5 tablet:flex-row tablet:items-center tablet:justify-between tablet:p-7"
        >
          <div className="flex flex-col gap-2">
            <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{COPY.eyebrow}</p>
            <h2 className="text-h4 font-black tracking-tight text-neutral-text-heading">{COPY.title}</h2>
            <p className="max-w-160 text-small text-neutral-text-label">{COPY.subtitle}</p>
          </div>
          <SaveState status={autosave.status} copy={COPY.save} onRetry={autosave.retry} />
        </motion.header>

        <MainDetailsCard index={1} idPrefix="contact-section" copy={SECTION_FORM} query={section} save={saveSection} />

        <form noValidate onSubmit={(event) => event.preventDefault()} className={EDITOR_GRID}>
          <div className="flex min-w-0 flex-col gap-5 xl:self-start">
            <EmailCard index={2} />
            <SocialsCard index={3} />
            <CtasCard index={4} sections={state.sections} hasCv={state.hasCv} />
          </div>
          <aside className="flex min-w-0 flex-col gap-5">
            <Checklist index={2} />
            <EditorHint title={COPY.hint.title} text={COPY.hint.text} />
          </aside>
        </form>
      </div>
    </FormProvider>
  );
}

function EmailCard({ index }) {
  const { register, control, formState } = useFormContext();
  const email = useWatch({ control, name: 'contactEmail' });
  return (
    <SectionCard index={index} eyebrow={COPY.email.eyebrow} className="tablet:p-8">
      <div className="mt-6 flex flex-col gap-5">
        <FormField
          id="contact-email"
          label={COPY.email.label}
          required
          hint={COPY.email.hint}
          error={formState.errors.contactEmail?.message}
          count={email.length}
          max={LIMITS.email}
        >
          {(aria) => <TextInput {...aria} type="email" inputMode="email" autoComplete="email" placeholder={COPY.email.placeholder} {...register('contactEmail')} />}
        </FormField>
        <FormField
          id="contact-whatsapp"
          label={COPY.whatsapp.label}
          optional={COPY.whatsapp.optional}
          hint={COPY.whatsapp.hint}
          error={formState.errors.whatsapp?.message}
        >
          {(aria) => <TextInput {...aria} type="tel" inputMode="tel" autoComplete="tel" placeholder={COPY.whatsapp.placeholder} {...register('whatsapp')} />}
        </FormField>
      </div>
    </SectionCard>
  );
}

/** The social icons of the Contact section: one row per platform, drag to reorder. */
function SocialsCard({ index }) {
  const { register, control, formState } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'socials', keyName: 'fieldKey' });
  const values = useWatch({ control, name: 'socials' });
  const errors = formState.errors.socials;
  const used = values.map((social) => social.platform);
  const unused = PLATFORM_KEYS.filter((platform) => !used.includes(platform));
  const full = fields.length >= MAX_SOCIALS;
  const nameOf = (position) => SOCIAL_PLATFORMS[values[position]?.platform] ?? '';
  const labelOf = (key) => nameOf(fields.findIndex((field) => field.key === key));

  return (
    <SectionCard
      index={index}
      eyebrow={COPY.socials.eyebrow}
      className="tablet:p-8"
      action={
        <button
          type="button"
          onClick={() => append(newSocial(unused[0]))}
          disabled={full}
          title={full ? COPY.socials.full : undefined}
          className={adminButton({ variant: 'secondary', size: 'sm' })}
        >
          <Plus aria-hidden className="size-4" />
          {COPY.socials.add}
        </button>
      }
    >
      <p className="mt-2 text-extra-small text-neutral-text-label">{COPY.socials.text}</p>
      <div className="mt-6 flex flex-col gap-3">
        {fields.length === 0 ? (
          <p className="rounded-lg bg-neutral-surface-raised px-4 py-6 text-center text-extra-small text-neutral-text-label">{COPY.socials.empty}</p>
        ) : (
          <SortableList
            ids={fields.map((field) => field.key)}
            onMove={move}
            labelOf={labelOf}
            labels={COPY.socials}
            className="flex flex-col gap-2"
          >
            {fields.map((field, position) => {
              const rowErrors = errors?.[position];
              const platform = values[position]?.platform;
              const message = rowErrors?.url?.message ?? rowErrors?.platform?.message;
              return (
                <SortableRow key={field.key} id={field.key} handleLabel={COPY.socials.move(nameOf(position))} className="items-start">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex min-w-0 flex-col gap-2 tablet:flex-row">
                      <SelectInput
                        size="row"
                        aria-label={COPY.socials.platform(position + 1)}
                        className="tablet:w-40 tablet:shrink-0"
                        {...register(`socials.${position}.platform`)}
                      >
                        {PLATFORM_KEYS.filter((key) => key === platform || !used.includes(key)).map((key) => (
                          <option key={key} value={key}>
                            {SOCIAL_PLATFORMS[key]}
                          </option>
                        ))}
                      </SelectInput>
                      <TextInput
                        size="row"
                        type="url"
                        inputMode="url"
                        aria-label={COPY.socials.url(nameOf(position))}
                        aria-invalid={rowErrors?.url ? true : undefined}
                        maxLength={LIMITS.url}
                        placeholder={COPY.socials.urlPlaceholder}
                        className="min-w-0 flex-1"
                        {...register(`socials.${position}.url`)}
                      />
                    </div>
                    {message && <p className="text-extra-small text-status-error">{message}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(position)}
                    aria-label={COPY.socials.remove(nameOf(position))}
                    className={adminButton({ variant: 'secondary', size: 'icon', className: 'size-9 hover:text-status-error' })}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </SortableRow>
              );
            })}
          </SortableList>
        )}
        <p className="self-end text-extra-small text-neutral-text-placeholder tabular-nums">{COPY.socials.count(fields.length)}</p>
      </div>
    </SectionCard>
  );
}

function CtasCard({ index, sections, hasCv }) {
  const { control } = useFormContext();
  const [email, number] = useWatch({ control, name: ['contactEmail', 'whatsapp'] });
  const contactEmail = EMAIL_PATTERN.test(email.trim()) ? email.trim() : '';
  const whatsapp = WHATSAPP_NUMBER.test(number.trim()) ? number.trim() : '';
  return (
    <SectionCard index={index} eyebrow={COPY.ctas.eyebrow} className="tablet:p-8">
      <p className="mt-2 text-extra-small text-neutral-text-label">{COPY.ctas.text}</p>
      <div className="mt-6 grid gap-4 tablet:grid-cols-2">
        <CtaEditor
          name="primaryCta"
          heading={COPY.ctas.primary}
          idPrefix="contact"
          copy={COPY.ctas}
          sections={sections}
          contactEmail={contactEmail}
          whatsapp={whatsapp}
          hasCv={hasCv}
        />
        <CtaEditor
          name="secondaryCta"
          heading={COPY.ctas.secondary}
          idPrefix="contact"
          copy={COPY.ctas}
          sections={sections}
          contactEmail={contactEmail}
          whatsapp={whatsapp}
          hasCv={hasCv}
          optional
        />
      </div>
    </SectionCard>
  );
}

/** Same items as the Overview checklist, read from what is typed here. */
function Checklist({ index }) {
  const reduce = useReducedMotion();
  const { control } = useFormContext();
  const [email, socials, primary] = useWatch({ control, name: ['contactEmail', 'socials', 'primaryCta'] });
  const needsTarget = primary.action === 'scroll' || primary.action === 'link';
  const items = [
    { key: 'email', done: EMAIL_PATTERN.test(email.trim()) },
    { key: 'socials', done: socials.filter((social) => isUrlLike(social.url)).length >= MIN_SOCIALS },
    { key: 'primary', done: Boolean(primary.label.trim()) && (!needsTarget || Boolean(primary.target.trim())) },
  ];
  const done = items.filter((item) => item.done).length;

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby="contact-checklist-title"
      className="flex min-w-0 flex-col gap-4 rounded-card bg-neutral-surface-0 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="contact-checklist-title" className={EYEBROW}>
          {COPY.checklist.eyebrow}
        </h2>
        <span className="text-extra-small text-neutral-text-placeholder tabular-nums">{COPY.checklist.done(done, items.length)}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-3 rounded-md bg-neutral-surface-raised px-4 py-3">
            <span
              aria-hidden
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full',
                item.done ? 'bg-fill-primary text-on-brand' : 'border border-neutral-text-placeholder/60',
              )}
            >
              {item.done && <Check className="size-3" />}
            </span>
            <span className={cn('text-small', item.done ? 'text-neutral-text-heading' : 'text-neutral-text-label')}>
              {COPY.checklist.items[item.key]}
              <span className="sr-only">{item.done ? ' (done)' : ' (to do)'}</span>
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
