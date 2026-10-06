import { ExternalLink, FileText, LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { adminButton } from '../../components/buttonStyles';
import ConfirmDialog from '../../components/ConfirmDialog';
import MediaPickerDialog from '../../components/MediaPickerDialog';
import SectionCard from '../../components/SectionCard';
import { useFilePicker } from '../../hooks/useMedia';
import { formatBytes } from '../../lib/format';
import { libraryFile, MEDIA_LABELS } from '../../lib/media';
import { IDENTITY } from './constants';

const COPY = IDENTITY.resume;
const EMPTY_CV = { url: '', publicId: '', name: '', bytes: 0 };

/** Figma 538:8352: the PDF behind every "Download CV" button. Replace or remove it; the file stays in the library. */
export default function ResumeCard({ index }) {
  const { control, setValue } = useFormContext();
  const cv = useWatch({ control, name: 'cv' });
  const [picking, setPicking] = useState(false);
  const [removing, setRemoving] = useState(false);
  const choose = (item) => setValue('cv', libraryFile(item), { shouldDirty: true });
  const picker = useFilePicker({ kind: 'file', messages: MEDIA_LABELS.fileErrors, onUploaded: choose });

  const uploadLabel = picker.uploading ? COPY.uploading(picker.progress ?? 0) : cv.url ? COPY.replace : COPY.upload;

  return (
    <SectionCard index={index} icon={FileText} title={COPY.title} description={COPY.description}>
      <div className="mt-7 flex flex-col gap-4 rounded-tile bg-neutral-surface-raised p-4 tablet:flex-row tablet:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-text-brand">
            <FileText className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="truncate text-extra-small font-semi-bold text-text-primary">{cv.url ? cv.name || COPY.title : COPY.empty}</p>
            <p className="text-extra-small text-neutral-text-placeholder">{cv.url ? COPY.meta(formatBytes(cv.bytes)) : COPY.emptyText}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cv.url && (
            <a
              href={cv.url}
              target="_blank"
              rel="noopener noreferrer"
              className={adminButton({ variant: 'secondary', size: 'sm' })}
            >
              <ExternalLink aria-hidden className="size-4" />
              {COPY.open}
            </a>
          )}
          <button
            type="button"
            onClick={picker.open}
            disabled={picker.uploading}
            aria-busy={picker.uploading || undefined}
            className={adminButton({ variant: 'secondary', size: 'sm' })}
          >
            {picker.uploading && <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />}
            {uploadLabel}
          </button>
          <button type="button" onClick={() => setPicking(true)} className={adminButton({ variant: 'secondary', size: 'sm' })}>
            {COPY.choose}
          </button>
          {cv.url && (
            <button
              type="button"
              onClick={() => setRemoving(true)}
              aria-label={COPY.remove}
              className={adminButton({ variant: 'secondary', size: 'icon', className: 'size-11 hover:text-status-error' })}
            >
              <Trash2 aria-hidden className="size-4" />
            </button>
          )}
          <input {...picker.inputProps} />
        </div>
      </div>
      {picker.error && (
        <p role="alert" className="mt-3 text-extra-small text-status-error">
          {picker.error}
        </p>
      )}

      <MediaPickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        kind="file"
        onSelect={([item]) => choose(item)}
        labels={MEDIA_LABELS}
      />
      <ConfirmDialog
        open={removing}
        onClose={() => setRemoving(false)}
        onConfirm={() => {
          setValue('cv', EMPTY_CV, { shouldDirty: true });
          setRemoving(false);
        }}
        title={COPY.removeTitle}
        description={COPY.removeText}
        confirmLabel={COPY.removeConfirm}
        cancelLabel={COPY.cancel}
        tone="danger"
        icon={Trash2}
      />
    </SectionCard>
  );
}
