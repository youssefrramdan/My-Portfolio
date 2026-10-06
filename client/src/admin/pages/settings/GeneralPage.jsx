import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, ExternalLink, Globe, Mail, Palette, PanelBottom, RotateCcw, UserRound } from 'lucide-react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { CONTACT_LIMITS } from '@shared/contact';
import { HEX_COLOR, isLightColor } from '@shared/identity';
import { DEFAULT_BRAND_COLOR, SETTINGS_LIMITS as LIMITS } from '@shared/settings';
import { cn } from '@/lib/utils';
import { adminButton } from '../../components/buttonStyles';
import ColorInput from '../../components/ColorInput';
import EditorHint from '../../components/content/EditorHint';
import ImageField from '../../components/content/ImageField';
import FormField, { TextInput } from '../../components/FormField';
import SectionCard from '../../components/SectionCard';
import { useSaveProfile } from '../../hooks/useAccount';
import { useMe } from '../../hooks/useAuth';
import { useAutosave } from '../../hooks/useAutosave';
import { useSaveSettings, useSettingsState } from '../../hooks/useSettingsAdmin';
import { displayHost } from '../../lib/format';
import { useCopy } from '../../lib/useCopy';
import { GENERAL as COPY, SETTINGS } from './constants';
import SettingsShell, { combineStatus, SETTINGS_ASIDE, SETTINGS_GRID, SettingsLoader } from './SettingsShell';
import { generalSchema, generalToForm, generalToPayload, profileSchema, profileToForm, profileToPayload, toSiteUrl } from './settingsForms';

/** `/admin/settings/general` (Figma 546:16718): site name + address, brand color, dashboard profile, contact email, footer. */
export default function GeneralPage() {
  const query = useSettingsState();
  const { data: user } = useMe();
  return (
    <SettingsLoader copy={COPY} query={query}>
      {(state) => <GeneralEditor state={state} user={user} />}
    </SettingsLoader>
  );
}

/** Two autosaving forms: the site settings and the admin profile (the sidebar user card). */
function GeneralEditor({ state, user }) {
  const form = useForm({ defaultValues: generalToForm(state), resolver: zodResolver(generalSchema), mode: 'onChange' });
  const { mutateAsync: saveGeneral } = useSaveSettings('general');
  const general = useAutosave({ form, schema: generalSchema, toPayload: generalToPayload, save: saveGeneral, leaveWarning: SETTINGS.save.leaveWarning });

  const profileForm = useForm({ defaultValues: profileToForm(user), resolver: zodResolver(profileSchema), mode: 'onChange' });
  const { mutateAsync: saveProfile } = useSaveProfile();
  const profile = useAutosave({
    form: profileForm,
    schema: profileSchema,
    toPayload: profileToPayload,
    save: saveProfile,
    leaveWarning: SETTINGS.save.leaveWarning,
  });

  const retry = () => [general, profile].filter((autosave) => autosave.status !== 'saved').forEach((autosave) => autosave.retry());

  return (
    <SettingsShell copy={COPY} status={combineStatus(general.status, profile.status)} onRetry={retry}>
      <div className={SETTINGS_GRID}>
        <div className="flex min-w-0 flex-col gap-5 xl:self-start">
          <FormProvider {...form}>
            <SiteCard index={3} />
            <BrandCard index={4} />
          </FormProvider>
          <FormProvider {...profileForm}>
            <ProfileCard index={5} />
          </FormProvider>
          <FormProvider {...form}>
            <EmailCard index={6} />
            <FooterCard index={7} />
          </FormProvider>
        </div>
        <aside className={SETTINGS_ASIDE}>
          <FormProvider {...form}>
            <AddressCard index={3} />
          </FormProvider>
          <EditorHint title={COPY.hint.title} text={COPY.hint.text} />
        </aside>
      </div>
    </SettingsShell>
  );
}

function SiteCard({ index }) {
  const { register, control, formState } = useFormContext();
  const [siteName, siteUrl] = useWatch({ control, name: ['siteName', 'siteUrl'] });
  const { errors } = formState;
  return (
    <SectionCard index={index} icon={Globe} title={COPY.site.title} description={COPY.site.description} className="tablet:p-8">
      <div className="mt-6 grid gap-5 tablet:grid-cols-2">
        <FormField
          id="settings-site-name"
          label={COPY.site.name.label}
          required
          hint={COPY.site.name.hint}
          error={errors.siteName?.message}
          count={siteName.length}
          max={LIMITS.siteName}
        >
          {(aria) => <TextInput {...aria} placeholder={COPY.site.name.placeholder} {...register('siteName')} />}
        </FormField>
        <FormField
          id="settings-site-url"
          label={COPY.site.url.label}
          required
          hint={COPY.site.url.hint}
          error={errors.siteUrl?.message}
          count={siteUrl.length}
          max={LIMITS.siteUrl}
        >
          {(aria) => (
            <TextInput {...aria} type="url" inputMode="url" autoComplete="url" spellCheck={false} placeholder={COPY.site.url.placeholder} {...register('siteUrl')} />
          )}
        </FormField>
      </div>
    </SectionCard>
  );
}

/** The site-wide brand color, with a live preview of a button and a highlighted title in the picked color. */
function BrandCard({ index }) {
  const { control, setValue, formState } = useFormContext();
  const color = useWatch({ control, name: 'brandColor' });
  const valid = HEX_COLOR.test(color);
  const onBrand = valid && isLightColor(color) ? 'text-neutral-surface-black' : 'text-neutral';

  return (
    <SectionCard index={index} icon={Palette} title={COPY.brand.title} description={COPY.brand.description} className="tablet:p-8">
      <div className="mt-6 grid gap-5 tablet:grid-cols-2">
        <FormField id="settings-brand-color" label={COPY.brand.label} hint={COPY.brand.hint} error={formState.errors.brandColor?.message}>
          {(aria) => (
            <div className="flex flex-wrap items-center gap-2">
              <ColorInput name="brandColor" label={COPY.brand.pick} inputProps={aria} className="flex-1" />
              <button
                type="button"
                onClick={() => setValue('brandColor', DEFAULT_BRAND_COLOR, { shouldDirty: true, shouldValidate: true })}
                disabled={color === DEFAULT_BRAND_COLOR}
                className={adminButton({ variant: 'secondary', size: 'sm' })}
              >
                <RotateCcw aria-hidden className="size-4" />
                {COPY.brand.reset}
              </button>
            </div>
          )}
        </FormField>
        <div className="flex flex-col gap-2">
          <p className="text-extra-small font-semi-bold text-neutral-text-label">{COPY.brand.preview}</p>
          <div className="flex flex-1 items-center gap-4 rounded-md bg-bg-primary px-4 py-3">
            <span
              style={valid ? { backgroundColor: color } : undefined}
              className={cn('rounded-full px-4 py-2 text-small font-semi-bold', onBrand)}
            >
              {COPY.brand.button}
            </span>
            <span className="text-large font-bold text-text-primary">
              <span style={valid ? { color } : undefined}>{COPY.brand.highlight}</span> {COPY.brand.text}
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function ProfileCard({ index }) {
  const { register, control, formState } = useFormContext();
  const [name, title] = useWatch({ control, name: ['name', 'title'] });
  const { errors } = formState;
  return (
    <SectionCard index={index} icon={UserRound} title={COPY.profile.title} description={COPY.profile.description} className="tablet:p-8">
      <div className="mt-6 flex flex-col gap-5">
        <ImageField name="avatar" idPrefix="settings-profile" copy={COPY.profile.photo} altMax={LIMITS.alt} round />
        <div className="grid gap-5 tablet:grid-cols-2">
          <FormField
            id="settings-profile-name"
            label={COPY.profile.name.label}
            required
            error={errors.name?.message}
            count={name.length}
            max={LIMITS.profileName}
          >
            {(aria) => <TextInput {...aria} autoComplete="name" placeholder={COPY.profile.name.placeholder} {...register('name')} />}
          </FormField>
          <FormField
            id="settings-profile-title"
            label={COPY.profile.role.label}
            error={errors.title?.message}
            count={title.length}
            max={LIMITS.profileTitle}
          >
            {(aria) => <TextInput {...aria} autoComplete="organization-title" placeholder={COPY.profile.role.placeholder} {...register('title')} />}
          </FormField>
        </div>
      </div>
    </SectionCard>
  );
}

function EmailCard({ index }) {
  const { register, control, formState } = useFormContext();
  const email = useWatch({ control, name: 'contactEmail' });
  return (
    <SectionCard index={index} icon={Mail} title={COPY.email.title} description={COPY.email.description} className="tablet:p-8">
      <div className="mt-6">
        <FormField
          id="settings-contact-email"
          label={COPY.email.label}
          required
          error={formState.errors.contactEmail?.message}
          count={email.length}
          max={CONTACT_LIMITS.email}
        >
          {(aria) => <TextInput {...aria} type="email" inputMode="email" autoComplete="email" placeholder={COPY.email.placeholder} {...register('contactEmail')} />}
        </FormField>
      </div>
    </SectionCard>
  );
}

function FooterCard({ index }) {
  const { register, control, formState } = useFormContext();
  const footer = useWatch({ control, name: 'footer' });
  const errors = formState.errors.footer;
  return (
    <SectionCard index={index} icon={PanelBottom} title={COPY.footer.title} description={COPY.footer.description} className="tablet:p-8">
      <div className="mt-6 grid gap-5 tablet:grid-cols-2">
        <FormField
          id="settings-footer-copyright"
          label={COPY.footer.copyright.label}
          error={errors?.copyright?.message}
          count={footer.copyright.length}
          max={LIMITS.copyright}
        >
          {(aria) => <TextInput {...aria} placeholder={COPY.footer.copyright.placeholder} {...register('footer.copyright')} />}
        </FormField>
        <FormField
          id="settings-footer-back"
          label={COPY.footer.backToTop.label}
          required
          error={errors?.backToTopLabel?.message}
          count={footer.backToTopLabel.length}
          max={LIMITS.backToTop}
        >
          {(aria) => <TextInput {...aria} placeholder={COPY.footer.backToTop.placeholder} {...register('footer.backToTopLabel')} />}
        </FormField>
      </div>
    </SectionCard>
  );
}

/** The address as it is typed (Figma "Public address"), with copy + open. */
function AddressCard({ index }) {
  const { control } = useFormContext();
  const url = toSiteUrl(useWatch({ control, name: 'siteUrl' }));
  const { status, copy } = useCopy(url);
  const copyLabel = { idle: COPY.address.copy, copied: COPY.address.copied, failed: COPY.address.failed }[status];

  return (
    <SectionCard index={index} eyebrow={COPY.address.eyebrow}>
      <p className="mt-4 truncate text-large font-bold text-text-brand" title={url || undefined}>
        {url ? displayHost(url) : COPY.address.empty}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={copy} disabled={!url} className={adminButton({ variant: 'secondary', size: 'sm' })}>
          {status === 'copied' ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
          <span aria-live="polite">{copyLabel}</span>
        </button>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className={adminButton({ variant: 'secondary', size: 'sm' })}>
            <ExternalLink aria-hidden className="size-4" />
            {COPY.address.open}
          </a>
        )}
      </div>
    </SectionCard>
  );
}
