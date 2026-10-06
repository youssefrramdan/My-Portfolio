import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, Hourglass } from 'lucide-react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { SETTINGS_LIMITS } from '@shared/settings';
import { COMING_SOON_PREVIEW } from '@/features/site/SiteGate';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton } from '../../components/buttonStyles';
import EditorHint from '../../components/content/EditorHint';
import ImageField from '../../components/content/ImageField';
import FormField, { TextArea, TextInput } from '../../components/FormField';
import SectionCard, { EYEBROW } from '../../components/SectionCard';
import Switch from '../../components/Switch';
import { useAutosave } from '../../hooks/useAutosave';
import { useOverview } from '../../hooks/useOverview';
import { useSaveSettings, useSettingsState } from '../../hooks/useSettingsAdmin';
import { COMING_SOON as COPY, SETTINGS } from './constants';
import SettingsShell, { SETTINGS_ASIDE, SETTINGS_GRID, SettingsLoader } from './SettingsShell';
import { comingSoonSchema, comingSoonToForm, comingSoonToPayload } from './settingsForms';

const LIMITS = COPY.limits;
const PREVIEW_HREF = `/?${COMING_SOON_PREVIEW.param}=${COMING_SOON_PREVIEW.value}`;

/** `/admin/settings/coming-soon`: the page visitors get while the site is unpublished. Autosaves. */
export default function ComingSoonPage() {
  const query = useSettingsState();
  return (
    <SettingsLoader copy={COPY} query={query}>
      {(state) => <ComingSoonEditor state={state} />}
    </SettingsLoader>
  );
}

function ComingSoonEditor({ state }) {
  const form = useForm({ defaultValues: comingSoonToForm(state), resolver: zodResolver(comingSoonSchema), mode: 'onChange' });
  const { mutateAsync } = useSaveSettings('coming-soon');
  const autosave = useAutosave({
    form,
    schema: comingSoonSchema,
    toPayload: comingSoonToPayload,
    save: mutateAsync,
    leaveWarning: SETTINGS.save.leaveWarning,
  });

  return (
    <FormProvider {...form}>
      <SettingsShell copy={COPY} status={autosave.status} onRetry={autosave.retry}>
        <div className={SETTINGS_GRID}>
          <ContentCard index={3} />
          <aside className={SETTINGS_ASIDE}>
            <StatusCard index={3} fallback={state.isPublished} />
            <EditorHint title={COPY.hint.title} text={COPY.hint.text} />
          </aside>
        </div>
      </SettingsShell>
    </FormProvider>
  );
}

function ContentCard({ index }) {
  const { register, control, formState, setValue } = useFormContext();
  const [badge, title, message, description, showEmail] = useWatch({ control, name: ['badge', 'title', 'message', 'description', 'showEmail'] });
  const errors = formState.errors;
  const field = COPY.content;

  return (
    <SectionCard index={index} icon={Hourglass} title={field.title} description={field.description} className="tablet:p-8 xl:self-start">
      <div className="mt-6 flex flex-col gap-5">
        <FormField id="coming-soon-badge" label={field.badge.label} error={errors.badge?.message} count={badge.length} max={LIMITS.badge}>
          {(aria) => <TextInput {...aria} placeholder={field.badge.placeholder} {...register('badge')} />}
        </FormField>
        <div className="grid gap-5 tablet:grid-cols-2">
          <FormField
            id="coming-soon-title"
            label={field.plain.label}
            required
            error={errors.title?.plain?.message}
            count={title.plain.length}
            max={LIMITS.title}
          >
            {(aria) => <TextInput {...aria} placeholder={field.plain.placeholder} {...register('title.plain')} />}
          </FormField>
          <FormField
            id="coming-soon-highlight"
            label={field.highlight.label}
            hint={field.highlight.hint}
            error={errors.title?.highlight?.message}
            count={title.highlight.length}
            max={LIMITS.title}
          >
            {(aria) => <TextInput {...aria} placeholder={field.highlight.placeholder} {...register('title.highlight')} />}
          </FormField>
        </div>
        <FormField id="coming-soon-message" label={field.message.label} error={errors.message?.message} count={message.length} max={LIMITS.message}>
          {(aria) => <TextArea {...aria} rows={3} placeholder={field.message.placeholder} {...register('message')} />}
        </FormField>
        <FormField
          id="coming-soon-description"
          label={field.smallPrint.label}
          error={errors.description?.message}
          count={description.length}
          max={LIMITS.description}
        >
          {(aria) => <TextInput {...aria} placeholder={field.smallPrint.placeholder} {...register('description')} />}
        </FormField>
        <ImageField name="image" idPrefix="coming-soon" copy={field.image} altMax={SETTINGS_LIMITS.alt} round />
        <div className="flex items-center justify-between gap-4 rounded-tile bg-neutral-surface-raised p-4">
          <div className="flex min-w-0 flex-col gap-1">
            <p id="coming-soon-email-label" className="text-small font-semi-bold text-neutral-text-heading">
              {field.showEmail.label}
            </p>
            <p id="coming-soon-email-text" className="text-extra-small text-neutral-text-label">
              {field.showEmail.text}
            </p>
          </div>
          <Switch
            on={showEmail}
            onToggle={() => setValue('showEmail', !showEmail, { shouldDirty: true })}
            labelledBy="coming-soon-email-label"
            describedBy="coming-soon-email-text"
          />
        </div>
      </div>
    </SectionCard>
  );
}

/** Follows the topbar Publish button (Overview query). */
function StatusCard({ index, fallback }) {
  const reduce = useReducedMotion();
  const { data: overview } = useOverview();
  const isPublished = overview?.site.isPublished ?? fallback;
  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby="coming-soon-status-title"
      className="flex min-w-0 flex-col gap-4 rounded-card bg-neutral-surface-0 p-5"
    >
      <h2 id="coming-soon-status-title" className={EYEBROW}>
        {COPY.status.title}
      </h2>
      <p className="flex items-start gap-3 text-small text-neutral-text-muted">
        <span aria-hidden className={cn('mt-1.5 size-2 shrink-0 rounded-full', isPublished ? 'bg-fill-primary' : 'bg-neutral-text-placeholder')} />
        {isPublished ? COPY.status.live : COPY.status.hidden}
      </p>
      <a href={PREVIEW_HREF} target="_blank" rel="noopener noreferrer" className={adminButton({ variant: 'secondary', size: 'sm' })}>
        <Eye aria-hidden className="size-4" />
        {COPY.status.preview}
      </a>
    </motion.section>
  );
}
