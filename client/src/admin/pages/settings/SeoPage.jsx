import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, ExternalLink, FileCode2, Image as ImageIcon, Search, ShieldCheck } from 'lucide-react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { SETTINGS_LIMITS } from '@shared/settings';
import { cldUrl } from '@/lib/cloudinary';
import { adminEnter } from '@/lib/motion';
import { adminButton } from '../../components/buttonStyles';
import Checklist from '../../components/Checklist';
import ImageField from '../../components/content/ImageField';
import FormField, { TextArea, TextInput } from '../../components/FormField';
import SectionCard, { EYEBROW } from '../../components/SectionCard';
import { useAutosave } from '../../hooks/useAutosave';
import { useOverview } from '../../hooks/useOverview';
import { useSaveSettings, useSettingsState } from '../../hooks/useSettingsAdmin';
import { displayHost } from '../../lib/format';
import { useCopy } from '../../lib/useCopy';
import { SEO as COPY, SETTINGS } from './constants';
import SettingsShell, { SETTINGS_ASIDE, SETTINGS_GRID, SettingsLoader } from './SettingsShell';
import { seoSchema, seoToForm, seoToPayload, verificationCode } from './settingsForms';

const SEARCH_CONSOLE_URL = 'https://search.google.com/search-console';
const TITLE_RANGE = [30, COPY.limits.title];
const DESCRIPTION_RANGE = [70, COPY.limits.description];

const inRange = (value, [min, max]) => value.trim().length >= min && value.trim().length <= max;

/** `/admin/settings/seo` (Figma 546:17464): default metadata, Search Console, favicon, sitemap and previews. */
export default function SeoPage() {
  const query = useSettingsState();
  return (
    <SettingsLoader copy={COPY} query={query}>
      {(state) => <SeoEditor state={state} />}
    </SettingsLoader>
  );
}

function SeoEditor({ state }) {
  const form = useForm({ defaultValues: seoToForm(state), resolver: zodResolver(seoSchema), mode: 'onChange' });
  const { mutateAsync } = useSaveSettings('seo');
  const autosave = useAutosave({ form, schema: seoSchema, toPayload: seoToPayload, save: mutateAsync, leaveWarning: SETTINGS.save.leaveWarning });
  const siteUrl = state.general.siteUrl || state.defaults.siteUrl;

  return (
    <FormProvider {...form}>
      <SettingsShell copy={COPY} status={autosave.status} onRetry={autosave.retry}>
        <div className={SETTINGS_GRID}>
          <div className="flex min-w-0 flex-col gap-5 xl:self-start">
            <SharingCard index={3} />
            <EnginesCard index={4} />
            <FilesCard index={5} siteUrl={siteUrl} />
          </div>
          <aside className={SETTINGS_ASIDE}>
            <SearchPreview index={3} siteUrl={siteUrl} />
            <SocialPreview index={4} siteUrl={siteUrl} fallback={state.defaults.image} />
            <SeoChecklist index={5} state={state} />
          </aside>
        </div>
      </SettingsShell>
    </FormProvider>
  );
}

function SharingCard({ index }) {
  const { register, control, formState } = useFormContext();
  const [title, description] = useWatch({ control, name: ['title', 'description'] });
  const { errors } = formState;
  return (
    <SectionCard index={index} icon={Search} title={COPY.sharing.title} description={COPY.sharing.description} className="tablet:p-8">
      <div className="mt-6 flex flex-col gap-5">
        <FormField
          id="seo-title"
          label={COPY.sharing.seoTitle.label}
          required
          hint={COPY.sharing.seoTitle.hint}
          error={errors.title?.message}
          count={title.length}
          max={COPY.limits.title}
        >
          {(aria) => <TextInput {...aria} placeholder={COPY.sharing.seoTitle.placeholder} {...register('title')} />}
        </FormField>
        <FormField
          id="seo-description"
          label={COPY.sharing.seoDescription.label}
          required
          hint={COPY.sharing.seoDescription.hint}
          error={errors.description?.message}
          count={description.length}
          max={COPY.limits.description}
        >
          {(aria) => <TextArea {...aria} rows={3} placeholder={COPY.sharing.seoDescription.placeholder} {...register('description')} />}
        </FormField>
        <ImageField name="image" idPrefix="seo" copy={COPY.sharing.image} altMax={SETTINGS_LIMITS.alt} />
      </div>
    </SectionCard>
  );
}

function EnginesCard({ index }) {
  const { register, formState } = useFormContext();
  return (
    <SectionCard
      index={index}
      icon={ShieldCheck}
      title={COPY.engines.title}
      description={COPY.engines.description}
      className="tablet:p-8"
      action={
        <a
          href={SEARCH_CONSOLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={adminButton({ variant: 'secondary', size: 'sm', className: 'hidden shrink-0 tablet:inline-flex' })}
        >
          <ExternalLink aria-hidden className="size-4" />
          {COPY.engines.verification.open}
        </a>
      }
    >
      <div className="mt-6 flex flex-col gap-5">
        <FormField
          id="seo-verification"
          label={COPY.engines.verification.label}
          optional={SETTINGS.optional}
          hint={COPY.engines.verification.hint}
          error={formState.errors.googleVerification?.message}
        >
          {(aria) => (
            <TextInput {...aria} spellCheck={false} autoComplete="off" placeholder={COPY.engines.verification.placeholder} {...register('googleVerification')} />
          )}
        </FormField>
        <a
          href={SEARCH_CONSOLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={adminButton({ variant: 'secondary', size: 'sm', className: 'self-start tablet:hidden' })}
        >
          <ExternalLink aria-hidden className="size-4" />
          {COPY.engines.verification.open}
        </a>
        <ImageField name="favicon" idPrefix="seo" copy={COPY.engines.favicon} altMax={SETTINGS_LIMITS.alt} />
      </div>
    </SectionCard>
  );
}

function FilesCard({ index, siteUrl }) {
  return (
    <SectionCard index={index} icon={FileCode2} title={COPY.files.title} description={COPY.files.description} className="tablet:p-8">
      <ul className="mt-6 flex flex-col gap-2">
        <FileRow name={COPY.files.sitemap} url={`${siteUrl}/sitemap.xml`} />
        <FileRow name={COPY.files.robots} url={`${siteUrl}/robots.txt`} />
      </ul>
    </SectionCard>
  );
}

function FileRow({ name, url }) {
  const { status, copy } = useCopy(url);
  return (
    <li className="flex items-center gap-3 rounded-tile bg-neutral-surface-raised p-3 pl-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-extra-small font-semi-bold text-neutral-text-heading">{name}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-extra-small text-neutral-text-label underline-offset-4 hover:text-text-brand hover:underline"
        >
          {url}
        </a>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={status === 'copied' ? COPY.files.copied : COPY.files.copy(name.toLowerCase())}
        className={adminButton({ variant: 'secondary', size: 'icon', className: 'size-10 shrink-0' })}
      >
        {status === 'copied' ? <Check aria-hidden className="size-4 text-text-brand" /> : <Copy aria-hidden className="size-4" />}
      </button>
    </li>
  );
}

/** Aside card shell (Figma: preview cards in the 340 column). */
function PreviewCard({ index, title, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-label={title}
      className="flex min-w-0 flex-col gap-4 rounded-card bg-neutral-surface-0 p-5"
    >
      <h2 className={EYEBROW}>{title}</h2>
      {children}
    </motion.section>
  );
}

/** Roughly how a Google result reads: address, title, description (clipped like the results page). */
function SearchPreview({ index, siteUrl }) {
  const { control } = useFormContext();
  const [title, description] = useWatch({ control, name: ['title', 'description'] });
  return (
    <PreviewCard index={index} title={COPY.preview.search}>
      <div aria-hidden className="flex min-w-0 flex-col gap-1.5 rounded-tile bg-neutral-surface-raised p-4">
        <span className="truncate text-extra-small text-neutral-text-placeholder">{displayHost(siteUrl)}</span>
        <span className="line-clamp-2 text-base font-semi-bold text-text-brand">{title.trim() || COPY.sharing.seoTitle.placeholder}</span>
        <span className="line-clamp-3 text-extra-small text-neutral-text-label">{description.trim() || COPY.sharing.seoDescription.placeholder}</span>
      </div>
    </PreviewCard>
  );
}

/** A shared link card: the sharing image (or the hero photo the site falls back to), title and domain. */
function SocialPreview({ index, siteUrl, fallback }) {
  const { control } = useFormContext();
  const [title, image] = useWatch({ control, name: ['title', 'image'] });
  const src = image.url || fallback.url;
  return (
    <PreviewCard index={index} title={COPY.preview.social}>
      <div aria-hidden className="overflow-hidden rounded-tile bg-neutral-surface-raised">
        <div className="flex aspect-[1200/630] items-center justify-center bg-neutral-surface-control">
          {src ? (
            <img src={cldUrl(src, { width: 720 })} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-extra-small text-neutral-text-placeholder">
              <ImageIcon className="size-5" />
              {COPY.preview.noImage}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 p-4">
          <span className="truncate text-small font-semi-bold text-neutral-text-heading">{title.trim() || COPY.sharing.seoTitle.placeholder}</span>
          <span className="truncate text-extra-small text-neutral-text-placeholder uppercase">{displayHost(siteUrl)}</span>
        </div>
      </div>
    </PreviewCard>
  );
}

function SeoChecklist({ index, state }) {
  const { control } = useFormContext();
  const { data: overview } = useOverview();
  const [title, description, image, verification] = useWatch({ control, name: ['title', 'description', 'image', 'googleVerification'] });
  const items = [
    { key: 'title', done: inRange(title, TITLE_RANGE) },
    { key: 'description', done: inRange(description, DESCRIPTION_RANGE) },
    { key: 'image', done: Boolean(image.url) },
    { key: 'url', done: Boolean(state.general.siteUrl) },
    { key: 'verification', done: Boolean(verificationCode(verification)) },
    { key: 'published', done: overview?.site.isPublished ?? state.isPublished },
  ].map((item) => ({ ...item, label: COPY.checklist.items[item.key] }));
  const done = items.filter((item) => item.done).length;

  return (
    <PreviewCard index={index} title={COPY.checklist.title}>
      <p className="-mt-2 text-extra-small text-neutral-text-placeholder tabular-nums">{COPY.checklist.done(done, items.length)}</p>
      <Checklist items={items} doneLabel={COPY.checklist.doneLabel} todoLabel={COPY.checklist.todoLabel} />
    </PreviewCard>
  );
}
