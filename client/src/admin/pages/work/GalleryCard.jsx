import { arrayMove } from '@dnd-kit/sortable';
import { Columns2, Images, LoaderCircle, Plus, RectangleHorizontal, TriangleAlert, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { loneHalfImages, WORK_LIMITS as LIMITS } from '@shared/work';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import MediaPickerDialog from '../../components/MediaPickerDialog';
import SectionCard from '../../components/SectionCard';
import SortableList, { SortableTile } from '../../components/SortableList';
import { useFilePicker } from '../../hooks/useMedia';
import { libraryImage, MEDIA_LABELS } from '../../lib/media';
import { WORK_EDITOR } from './constants';
import { imageKey } from './workForm';

const COPY = WORK_EDITOR.gallery;
const LAYOUT_ICONS = { full: RectangleHorizontal, half: Columns2 };

const IMAGE_RATIO = { full: 'aspect-5/2', half: 'aspect-4/3' };

/**
 * Figma 538:9373 "Gallery": the project page images in order, laid out like the page (a two-column grid: full
 * images take the row, two halves share one, a half without a partner leaves its pair slot empty and is flagged).
 * Drag a tile (or its handle, or use the keyboard) to reorder; the dragged image floats under the pointer while
 * the others glide to their new places.
 */
export default function GalleryCard({ index }) {
  const { control, setValue, getValues } = useFormContext();
  const gallery = useWatch({ control, name: 'gallery' });
  const [picking, setPicking] = useState(false);
  const room = LIMITS.gallery - gallery.length;
  const lone = new Set(loneHalfImages(gallery));
  const ids = gallery.map(imageKey);

  const setGallery = (next) => setValue('gallery', next, { shouldDirty: true });
  // Reads the latest gallery: uploads finish after the render that started them.
  const addImages = (items) => {
    const current = getValues('gallery');
    const known = new Set(current.map(imageKey));
    const fresh = items
      .map((item) => ({ ...libraryImage(item), layout: 'full' }))
      .filter((image) => !known.has(imageKey(image)));
    setGallery([...current, ...fresh].slice(0, LIMITS.gallery));
  };
  const update = (position, patch) => setGallery(gallery.map((image, current) => (current === position ? { ...image, ...patch } : image)));
  const picker = useFilePicker({ kind: 'image', messages: MEDIA_LABELS.fileErrors, multiple: true, max: room, onUploaded: addImages });

  const imageOf = (id) => gallery.find((image) => imageKey(image) === id);

  return (
    <SectionCard
      index={index}
      title={COPY.title}
      description={COPY.description}
      icon={Images}
      className="tablet:p-8"
      action={
        <span className="shrink-0 pt-1 text-extra-small text-neutral-text-placeholder tabular-nums">{COPY.count(gallery.length)}</span>
      }
    >
      <div className="mt-6 flex flex-col gap-4">
        {gallery.length ? (
          <SortableList
            ids={ids}
            layout="grid"
            as="ul"
            live
            onMove={(from, to) => setGallery(arrayMove(gallery, from, to))}
            labelOf={(id) => COPY.imageLabel(ids.indexOf(id) + 1)}
            labels={COPY}
            className="grid grid-cols-2 gap-3"
            renderOverlay={(id) => <TileOverlay image={imageOf(id)} number={ids.indexOf(id) + 1} />}
          >
            {gallery.map((image, position) => (
              <SortableTile
                key={imageKey(image)}
                id={imageKey(image)}
                dragAnywhere
                handleLabel={COPY.move(position + 1)}
                className={cn(
                  'flex flex-col gap-2 rounded-lg bg-neutral-surface-raised p-2',
                  image.layout === 'full' && 'col-span-2',
                  lone.has(position) && 'ring-1 ring-status-warning/40',
                )}
              >
                <div className={cn('relative overflow-hidden rounded-md bg-neutral-surface-control', IMAGE_RATIO[image.layout])}>
                  <img
                    src={cldUrl(image.url, { width: 360 })}
                    alt={image.alt}
                    draggable={false}
                    className="size-full object-cover object-top select-none"
                  />
                  <span
                    aria-hidden
                    className="absolute bottom-1.5 left-1.5 rounded-sm bg-bg-primary/70 px-1.5 py-0.5 text-extra-small font-semi-bold text-text-primary tabular-nums backdrop-blur-glass"
                  >
                    {position + 1}
                  </span>
                  {lone.has(position) && (
                    <span
                      aria-hidden
                      className="absolute right-1.5 bottom-1.5 flex size-6 items-center justify-center rounded-sm bg-bg-primary/70 text-status-warning backdrop-blur-glass"
                    >
                      <TriangleAlert className="size-3.5" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setGallery(gallery.filter((_, current) => current !== position))}
                    aria-label={COPY.remove(position + 1)}
                    className={cn(
                      'absolute top-1 right-1 flex size-6 items-center justify-center rounded-sm bg-bg-primary/70 text-neutral-text-muted backdrop-blur-glass transition-colors hover:text-status-error',
                      FOCUS_RING,
                    )}
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                </div>

                <div className={cn('flex flex-col gap-2', image.layout === 'full' && 'tablet:flex-row')}>
                  <LayoutToggle
                    value={image.layout}
                    label={COPY.layoutLabel(position + 1, COPY.layouts[image.layout])}
                    onChange={(layout) => update(position, { layout })}
                    className={image.layout === 'full' ? 'tablet:w-52 tablet:shrink-0' : undefined}
                  />
                  <input
                    value={image.alt}
                    onChange={(event) => update(position, { alt: event.target.value })}
                    maxLength={LIMITS.alt}
                    placeholder={COPY.alt.placeholder}
                    aria-label={COPY.altLabel(position + 1)}
                    className="h-8 w-full min-w-0 rounded-sm bg-neutral-surface-control px-2.5 text-extra-small text-text-primary outline-none placeholder:text-neutral-text-placeholder focus:ring-1 focus:ring-fill-primary"
                  />
                </div>
              </SortableTile>
            ))}
          </SortableList>
        ) : (
          <p className="rounded-lg border border-dashed border-neutral-surface-control px-5 py-8 text-center text-extra-small text-neutral-text-label">
            {COPY.empty}
          </p>
        )}

        {lone.size > 0 && (
          <p className="flex items-start gap-2 rounded-md bg-status-warning/6 px-3 py-2.5 text-extra-small text-status-warning">
            <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
            {COPY.lonePartner}
          </p>
        )}

        {room > 0 ? (
          <div className="flex flex-col gap-2 tablet:flex-row">
            <button type="button" onClick={() => setPicking(true)} className={adminButton({ size: 'sm' })}>
              <Plus aria-hidden className="size-4.5" />
              {COPY.add}
            </button>
            <button
              type="button"
              onClick={picker.open}
              disabled={picker.uploading}
              aria-busy={picker.uploading || undefined}
              className={adminButton({ variant: 'secondary', size: 'sm' })}
            >
              {picker.uploading ? <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" /> : <Upload aria-hidden className="size-4" />}
              {picker.uploading ? COPY.uploading(picker.progress ?? 0) : COPY.upload}
            </button>
            <input {...picker.inputProps} />
          </div>
        ) : (
          <p className="text-extra-small text-neutral-text-placeholder">{COPY.full}</p>
        )}
        {picker.error && (
          <p role="alert" className="text-extra-small text-status-error">
            {picker.error}
          </p>
        )}
      </div>

      <MediaPickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        kind="image"
        multiple
        max={room}
        onSelect={addImages}
        labels={MEDIA_LABELS}
      />
    </SectionCard>
  );
}

/** Full / half width switch of one image (a two-option toggle group). */
function LayoutToggle({ value, label, onChange, className }) {
  return (
    <div role="group" aria-label={label} className={cn('grid grid-cols-2 gap-1 rounded-sm bg-neutral-surface-control p-0.5', className)}>
      {Object.entries(COPY.layouts).map(([layout, name]) => {
        const Icon = LAYOUT_ICONS[layout];
        const active = value === layout;
        return (
          <button
            key={layout}
            type="button"
            aria-pressed={active}
            title={name}
            onClick={() => onChange(layout)}
            className={cn(
              'flex h-7 items-center justify-center gap-1.5 rounded-xs text-extra-small transition-colors',
              active ? 'bg-neutral-surface-raised font-semi-bold text-text-brand' : 'text-neutral-text-label hover:text-text-primary',
              FOCUS_RING,
            )}
          >
            <Icon aria-hidden className="size-3.5" />
            <span className="sr-only tablet:not-sr-only">{name.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

/** The image under the pointer while dragging (same size as its tile): lifted, slightly tilted, brand ring. */
function TileOverlay({ image, number }) {
  if (!image) return null;
  return (
    <div className="flex h-full cursor-grabbing flex-col gap-2 rounded-lg bg-neutral-surface-raised p-2 shadow-2xl ring-1 shadow-bg-primary ring-fill-primary/50 motion-safe:scale-103 motion-safe:-rotate-1">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-md bg-neutral-surface-control">
        <img src={cldUrl(image.url, { width: 360 })} alt="" draggable={false} className="size-full object-cover object-top" />
        <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-fill-primary px-1.5 py-0.5 text-extra-small font-semi-bold text-on-brand tabular-nums">
          {number}
        </span>
      </div>
    </div>
  );
}
