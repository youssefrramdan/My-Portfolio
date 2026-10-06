import { ArrowRight, Image as ImageIcon, LoaderCircle, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { WORK_LIMITS as LIMITS } from '@shared/work';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import FormField, { TextArea, TextInput } from '../../components/FormField';
import MediaPickerDialog from '../../components/MediaPickerDialog';
import SectionCard from '../../components/SectionCard';
import { useFilePicker } from '../../hooks/useMedia';
import { libraryImage, MEDIA_LABELS } from '../../lib/media';
import { WORK_EDITOR } from './constants';

const COPY = WORK_EDITOR.required;
const EMPTY_IMAGE = { url: '', publicId: '', alt: '' };

/** Figma 538:9256: what publishing needs: title, short summary and the cover image. */
export default function RequiredDetailsCard({ index }) {
  const { register, control, formState } = useFormContext();
  const [title, description] = useWatch({ control, name: ['title', 'description'] });
  const { errors } = formState;

  return (
    <SectionCard index={index} eyebrow={COPY.eyebrow} className="tablet:p-8">
      <div className="mt-6 flex flex-col gap-6">
        <FormField
          id="work-title"
          label={COPY.title.label}
          required
          error={errors.title?.message}
          count={title.length}
          max={LIMITS.title}
        >
          {(aria) => <TextInput {...aria} placeholder={COPY.title.placeholder} {...register('title')} />}
        </FormField>
        <FormField
          id="work-description"
          label={COPY.description.label}
          required
          error={errors.description?.message}
          count={description.length}
          max={LIMITS.description}
        >
          {(aria) => <TextArea {...aria} placeholder={COPY.description.placeholder} {...register('description')} />}
        </FormField>
        <CoverField />
      </div>
    </SectionCard>
  );
}

function CoverField() {
  const { register, control, setValue, clearErrors, formState } = useFormContext();
  const cover = useWatch({ control, name: 'coverImage' });
  const [picking, setPicking] = useState(false);
  const choose = (item) => {
    setValue('coverImage', libraryImage(item, cover.alt), { shouldDirty: true });
    clearErrors('coverImage');
  };
  const picker = useFilePicker({ kind: 'image', messages: MEDIA_LABELS.fileErrors, onUploaded: choose });
  const error = formState.errors.coverImage?.message;
  const errorId = 'work-cover-error';

  return (
    <div className="flex flex-col gap-2.5">
      <p id="work-cover-label" className="text-extra-small font-semi-bold text-neutral-text-muted">
        {COPY.cover.label}
        <span aria-hidden className="ml-1 text-text-brand">
          *
        </span>
      </p>

      {cover.url ? (
        <div className="flex flex-col gap-4 rounded-xl bg-neutral-surface-input p-3 tablet:flex-row tablet:items-center tablet:p-4">
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-neutral-surface-control tablet:w-56">
            <img src={cldUrl(cover.url, { width: 640 })} alt={cover.alt} className="size-full object-cover" />
            {picker.uploading && <UploadingVeil progress={picker.progress} />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <FormField id="work-cover-alt" label={COPY.cover.alt.label} optional={COPY.cover.alt.optional}>
              {(aria) => (
                <TextInput
                  {...aria}
                  size="sm"
                  maxLength={LIMITS.alt}
                  placeholder={COPY.cover.alt.placeholder}
                  {...register('coverImage.alt')}
                />
              )}
            </FormField>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setPicking(true)} className={adminButton({ variant: 'secondary', size: 'sm' })}>
                <RefreshCw aria-hidden className="size-4" />
                {COPY.cover.replace}
              </button>
              <UploadButton picker={picker} />
              <button
                type="button"
                onClick={() => setValue('coverImage', EMPTY_IMAGE, { shouldDirty: true })}
                aria-label={COPY.cover.remove}
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
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'group flex min-w-0 flex-1 items-center gap-4 rounded-xl bg-neutral-surface-input p-4 text-left transition-colors hover:bg-neutral-surface-control',
              error && 'ring-1 ring-status-error',
              FOCUS_RING,
            )}
          >
            <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-tile bg-neutral-surface-control text-text-brand">
              <ImageIcon className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-small font-semi-bold text-text-primary">{COPY.cover.choose}</span>
              <span className="text-extra-small text-neutral-text-placeholder">{COPY.cover.hint}</span>
            </span>
            <ArrowRight
              aria-hidden
              className="size-4.5 shrink-0 text-neutral-text-placeholder transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-text-brand"
            />
          </button>
          <UploadButton picker={picker} className="h-auto min-h-11 tablet:px-5" />
        </div>
      )}
      <input {...picker.inputProps} />

      {error && (
        <p id={errorId} className="text-extra-small text-status-error">
          {error}
        </p>
      )}
      {picker.error && (
        <p role="alert" className="text-extra-small text-status-error">
          {picker.error}
        </p>
      )}

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

function UploadButton({ picker, className }) {
  return (
    <button
      type="button"
      onClick={picker.open}
      disabled={picker.uploading}
      aria-busy={picker.uploading || undefined}
      className={adminButton({ variant: 'secondary', size: 'sm', className })}
    >
      {picker.uploading ? <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" /> : <Upload aria-hidden className="size-4" />}
      {picker.uploading ? COPY.cover.uploading(picker.progress ?? 0) : COPY.cover.upload}
    </button>
  );
}

function UploadingVeil({ progress }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center gap-2 bg-bg-primary/70 text-small text-text-primary backdrop-blur-glass">
      <LoaderCircle aria-hidden className="size-4.5 motion-safe:animate-spin" />
      {COPY.cover.uploading(progress ?? 0)}
    </span>
  );
}
