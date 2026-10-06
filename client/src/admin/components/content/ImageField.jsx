import { ArrowRight, Image as ImageIcon, LoaderCircle, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { useFilePicker } from '../../hooks/useMedia';
import { libraryImage, MEDIA_LABELS } from '../../lib/media';
import { adminButton, FOCUS_RING } from '../buttonStyles';
import FormField, { TextInput } from '../FormField';
import MediaPickerDialog from '../MediaPickerDialog';

const EMPTY_IMAGE = { url: '', publicId: '', alt: '' };

/** Optional-image copy shared by the modules (`label` + `alt` placeholder differ). */
export const imageFieldCopy = ({ label, altPlaceholder, hint = 'PNG, JPG, WEBP, SVG' }) => ({
  label,
  optional: 'Optional',
  choose: 'Choose from Media',
  hint,
  replace: 'Replace',
  upload: 'Upload new',
  uploading: (progress) => `Uploading ${progress}%`,
  remove: `Remove ${label.toLowerCase()}`,
  alt: { label: 'Alt text', optional: 'Optional', placeholder: altPlaceholder },
});

/**
 * Optional `{ url, publicId, alt }` image of a form (inside a `FormProvider`): pick from the media library or upload,
 * then alt text / replace / remove. `round` previews it as an avatar.
 */
export default function ImageField({ name, idPrefix, copy, altMax, round = false }) {
  const { register, control, setValue } = useFormContext();
  const image = useWatch({ control, name });
  const [picking, setPicking] = useState(false);
  const choose = (item) => setValue(name, libraryImage(item, image.alt), { shouldDirty: true });
  const picker = useFilePicker({ kind: 'image', messages: MEDIA_LABELS.fileErrors, onUploaded: choose });

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-extra-small font-semi-bold text-neutral-text-muted">
        {copy.label}
        <span className="ml-2 font-regular text-neutral-text-placeholder">{copy.optional}</span>
      </p>

      {image.url ? (
        <div className="flex flex-col gap-4 rounded-xl bg-neutral-surface-input p-3 tablet:flex-row tablet:items-center tablet:p-4">
          <div
            className={cn(
              'relative flex size-20 shrink-0 items-center justify-center overflow-hidden bg-neutral-surface-control',
              round ? 'rounded-full' : 'rounded-md',
            )}
          >
            <img src={cldUrl(image.url, { width: 160 })} alt={image.alt} className={cn('size-full', round ? 'object-cover' : 'object-contain p-2')} />
            {picker.uploading && (
              <span className="absolute inset-0 flex items-center justify-center bg-bg-primary/70 backdrop-blur-glass">
                <LoaderCircle aria-hidden className="size-4.5 motion-safe:animate-spin" />
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <FormField id={`${idPrefix}-${name}-alt`} label={copy.alt.label} optional={copy.alt.optional}>
              {(aria) => <TextInput {...aria} size="sm" maxLength={altMax} placeholder={copy.alt.placeholder} {...register(`${name}.alt`)} />}
            </FormField>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setPicking(true)} className={adminButton({ variant: 'secondary', size: 'sm' })}>
                <RefreshCw aria-hidden className="size-4" />
                {copy.replace}
              </button>
              <UploadButton picker={picker} copy={copy} />
              <button
                type="button"
                onClick={() => setValue(name, EMPTY_IMAGE, { shouldDirty: true })}
                aria-label={copy.remove}
                className={adminButton({ variant: 'secondary', size: 'icon', className: 'size-11 hover:text-status-error' })}
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 tablet:flex-row">
          <button
            type="button"
            onClick={() => setPicking(true)}
            className={cn(
              'group flex min-w-0 flex-1 items-center gap-4 rounded-xl bg-neutral-surface-input p-4 text-left transition-colors hover:bg-neutral-surface-control',
              FOCUS_RING,
            )}
          >
            <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-tile bg-neutral-surface-control text-text-brand">
              <ImageIcon className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-small font-semi-bold text-text-primary">{copy.choose}</span>
              <span className="text-extra-small text-neutral-text-placeholder">{copy.hint}</span>
            </span>
            <ArrowRight
              aria-hidden
              className="size-4.5 shrink-0 text-neutral-text-placeholder transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-text-brand"
            />
          </button>
          <UploadButton picker={picker} copy={copy} className="h-auto min-h-11 tablet:px-5" />
        </div>
      )}
      <input {...picker.inputProps} />
      {picker.error && (
        <p role="alert" className="text-extra-small text-status-error">
          {picker.error}
        </p>
      )}

      <MediaPickerDialog open={picking} onClose={() => setPicking(false)} kind="image" onSelect={([item]) => choose(item)} labels={MEDIA_LABELS} />
    </div>
  );
}

function UploadButton({ picker, copy, className }) {
  return (
    <button
      type="button"
      onClick={picker.open}
      disabled={picker.uploading}
      aria-busy={picker.uploading || undefined}
      className={adminButton({ variant: 'secondary', size: 'sm', className })}
    >
      {picker.uploading ? <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" /> : <Upload aria-hidden className="size-4" />}
      {picker.uploading ? copy.uploading(picker.progress ?? 0) : copy.upload}
    </button>
  );
}
