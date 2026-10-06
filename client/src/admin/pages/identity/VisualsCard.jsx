import { Camera, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { IDENTITY_LIMITS as LIMITS } from '@shared/identity';
import { cldUrl } from '@/lib/cloudinary';
import { adminButton } from '../../components/buttonStyles';
import ColorInput from '../../components/ColorInput';
import FormField, { TextInput } from '../../components/FormField';
import MediaPickerDialog from '../../components/MediaPickerDialog';
import SectionCard from '../../components/SectionCard';
import { useFilePicker } from '../../hooks/useMedia';
import { libraryImage, MEDIA_LABELS } from '../../lib/media';
import { IDENTITY } from './constants';

const COPY = IDENTITY.visuals;

/** Figma 538:8273: the hero portrait (with alt text) and the logo used in the navbar and footer. */
export default function VisualsCard({ index }) {
  const { register, control, formState } = useFormContext();
  const [photo, logo, displayName] = useWatch({ control, name: ['photo', 'logo', 'displayName'] });
  const initial = displayName.trim().charAt(0).toUpperCase() || 'M';

  return (
    <SectionCard index={index} icon={Camera} title={COPY.title} description={COPY.description}>
      <div className="mt-7 grid gap-4 tablet:grid-cols-2">
        <ImagePanel
          name="photo"
          image={photo}
          copy={COPY.portrait}
          required
          preview={
            photo.url ? (
              <img src={cldUrl(photo.url, { width: 800 })} alt={photo.alt} className="size-full object-cover object-top" />
            ) : (
              <span className="text-extra-small text-neutral-text-placeholder">{COPY.portrait.empty}</span>
            )
          }
        >
          <FormField
            id="identity-photo-alt"
            label={COPY.alt.label}
            optional={COPY.alt.optional}
            error={formState.errors.photo?.alt?.message}
          >
            {(aria) => (
              <TextInput {...aria} size="sm" maxLength={LIMITS.alt} placeholder={COPY.alt.placeholder} {...register('photo.alt')} />
            )}
          </FormField>
          <FormField
            id="identity-photo-cursor"
            label={COPY.cursor.label}
            optional={COPY.cursor.optional}
            hint={COPY.cursor.hint}
            error={formState.errors.photoCursor?.label?.message}
          >
            {(aria) => (
              <TextInput
                {...aria}
                size="sm"
                maxLength={LIMITS.cursorLabel}
                placeholder={COPY.cursor.placeholder}
                {...register('photoCursor.label')}
              />
            )}
          </FormField>
          <div className="grid grid-cols-2 gap-2">
            <ColorInput name="photoCursor.color" label={COPY.cursor.color} ariaLabel={COPY.cursor.colorHex(COPY.cursor.color)} />
            <ColorInput
              name="photoCursor.background"
              label={COPY.cursor.background}
              ariaLabel={COPY.cursor.colorHex(COPY.cursor.background)}
            />
          </div>
        </ImagePanel>

        <ImagePanel
          name="logo"
          image={logo}
          copy={COPY.logo}
          preview={
            logo.url ? (
              <img src={cldUrl(logo.url, { width: 320 })} alt={logo.alt} className="size-32 rounded-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-16 items-center justify-center rounded-tile bg-fill-primary text-h6 font-black text-on-brand"
                >
                  {initial}
                </span>
                <span className="text-extra-small text-neutral-text-placeholder">{COPY.logo.fallback}</span>
              </span>
            )
          }
        />
      </div>
    </SectionCard>
  );
}

function ImagePanel({ name, image, copy, required, preview, children }) {
  const { setValue } = useFormContext();
  const [picking, setPicking] = useState(false);
  const choose = (item) => setValue(name, libraryImage(item, image.alt), { shouldDirty: true });
  const picker = useFilePicker({ kind: 'image', messages: MEDIA_LABELS.fileErrors, onUploaded: choose });

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-xl bg-neutral-surface-raised p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-extra-small font-semi-bold text-neutral-text-heading">
            {copy.label}
            {required && (
              <span aria-hidden className="ml-1 text-text-brand">
                *
              </span>
            )}
          </p>
          <p className="text-extra-small text-neutral-text-placeholder">{copy.hint}</p>
        </div>
        {image.url && (
          <span className="rounded-full bg-fill-primary/10 px-2.5 py-1 text-extra-small font-semi-bold text-text-brand uppercase">
            {COPY.inUse}
          </span>
        )}
      </div>

      <div className="relative flex h-67 items-center justify-center overflow-hidden rounded-tile bg-neutral-surface-control">
        {preview}
        {picker.uploading && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 bg-bg-primary/70 text-small text-text-primary backdrop-blur-glass">
            <LoaderCircle aria-hidden className="size-4.5 motion-safe:animate-spin" />
            {COPY.uploading(picker.progress ?? 0)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={picker.open}
          disabled={picker.uploading}
          aria-busy={picker.uploading || undefined}
          className={adminButton({ variant: 'secondary', size: 'sm' })}
        >
          {copy.upload}
        </button>
        <button type="button" onClick={() => setPicking(true)} className={adminButton({ variant: 'secondary', size: 'sm' })}>
          {COPY.choose}
        </button>
        <input {...picker.inputProps} />
      </div>
      {picker.error && (
        <p role="alert" className="text-extra-small text-status-error">
          {picker.error}
        </p>
      )}

      {children}

      <MediaPickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        kind="image"
        onSelect={([item]) => choose(item)}
        labels={MEDIA_LABELS}
      />
    </div>
  );
}
