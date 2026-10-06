import { arrayMove } from '@dnd-kit/sortable';
import { CornerDownLeft, Image as ImageIcon, ImagePlus, LoaderCircle, Plus, Trash2, TriangleAlert, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { anchorAt, anchorIndex, IDENTITY_LIMITS as LIMITS, IMAGE_INTERVAL, titleWords } from '@shared/identity';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField, { TextInput } from '../../components/FormField';
import MediaPickerDialog from '../../components/MediaPickerDialog';
import Popover, { PopoverItem } from '../../components/Popover';
import SortableList, { SortableTile } from '../../components/SortableList';
import { useFilePicker } from '../../hooks/useMedia';
import { libraryImage, MEDIA_LABELS } from '../../lib/media';
import { IDENTITY } from './constants';

const COPY = IDENTITY.images;

/**
 * "Headline images": pick the gaps between title words where an image spot (max 2) or the line break goes,
 * then fill each spot with up to 6 images that rotate on the site. Spots and the break follow their word.
 */
export default function HeadlineImagesTab() {
  const { control, setValue, register, formState } = useFormContext();
  const [title, imageSlots, lineBreak] = useWatch({ control, name: ['title', 'imageSlots', 'lineBreak'] });
  const [removing, setRemoving] = useState(null);
  const words = titleWords(title);

  if (!words.length) return <p className="text-small text-neutral-text-label">{COPY.empty}</p>;

  const placed = imageSlots
    .map((slot, index) => ({ slot, index, at: anchorIndex(words, slot) }))
    .filter((item) => item.at !== -1)
    .sort((a, b) => a.at - b.at);
  const spotAt = (wordIndex) => placed.find((item) => item.at === wordIndex);
  const numberOf = (index) => placed.findIndex((item) => item.index === index) + 1;
  const breakAt = anchorIndex(words, lineBreak);
  const isFull = imageSlots.length >= LIMITS.imageSlots;

  const update = (name, value) => setValue(name, value, { shouldDirty: true });
  const addSpot = (wordIndex) => update('imageSlots', [...imageSlots, { ...anchorAt(words, wordIndex), images: [] }]);
  const removeSpot = (index) => update('imageSlots', imageSlots.filter((_, current) => current !== index));
  const askRemoveSpot = (index) => (imageSlots[index].images.length ? setRemoving(index) : removeSpot(index));
  const toggleBreak = (wordIndex) => update('lineBreak', breakAt === wordIndex ? null : anchorAt(words, wordIndex));

  return (
    <div className="flex flex-col gap-6">
      <p className="text-extra-small text-neutral-text-label">{COPY.intro}</p>

      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-3 rounded-tile bg-neutral-surface-raised p-4">
        {words.map((word, wordIndex) => {
          const spot = spotAt(wordIndex);
          const isLast = wordIndex === words.length - 1;
          return (
            <li key={`${word}-${wordIndex}`} className="flex items-center gap-1.5">
              <span className="rounded-full bg-neutral-surface-input px-3 py-1.5 text-small text-text-primary">{word}</span>
              {spot && (
                <span className="inline-flex items-center gap-1 rounded-full bg-fill-primary/10 px-2.5 py-1 text-extra-small font-semi-bold text-text-brand">
                  <ImageIcon aria-hidden className="size-3" />
                  {COPY.spotBadge(numberOf(spot.index))}
                </span>
              )}
              {breakAt === wordIndex && (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-surface-control px-2.5 py-1 text-extra-small text-neutral-text-muted">
                  <CornerDownLeft aria-hidden className="size-3" />
                  {COPY.lineBreakBadge}
                </span>
              )}
              <Popover
                trigger={(props) => (
                  <button
                    type="button"
                    {...props}
                    aria-label={COPY.gapLabel(word)}
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full border border-dashed border-neutral-text-placeholder text-neutral-text-label transition-colors hover:border-fill-primary hover:text-text-brand',
                      FOCUS_RING,
                    )}
                  >
                    <Plus aria-hidden className="size-3.5" />
                  </button>
                )}
              >
                {({ close }) => (
                  <div className="flex min-w-56 flex-col">
                    {spot ? (
                      <PopoverItem
                        icon={Trash2}
                        tone="danger"
                        onClick={() => {
                          close();
                          askRemoveSpot(spot.index);
                        }}
                      >
                        {COPY.removeSpot}
                      </PopoverItem>
                    ) : (
                      <PopoverItem
                        icon={ImagePlus}
                        disabled={isFull}
                        onClick={() => {
                          addSpot(wordIndex);
                          close();
                        }}
                      >
                        {isFull ? COPY.maxSpots : COPY.addSpot}
                      </PopoverItem>
                    )}
                    {!isLast && (
                      <PopoverItem
                        icon={CornerDownLeft}
                        onClick={() => {
                          toggleBreak(wordIndex);
                          close();
                        }}
                      >
                        {breakAt === wordIndex ? COPY.removeBreak : COPY.addBreak}
                      </PopoverItem>
                    )}
                  </div>
                )}
              </Popover>
            </li>
          );
        })}
      </ol>

      {placed.length > 0 && (
        <FormField
          id="identity-image-interval"
          label={COPY.interval.label}
          hint={COPY.interval.hint}
          error={formState.errors.imageInterval?.message}
          className="max-w-xs"
        >
          {(aria) => (
            <div className="relative">
              <TextInput
                {...aria}
                size="sm"
                type="number"
                inputMode="decimal"
                min={IMAGE_INTERVAL.min}
                max={IMAGE_INTERVAL.max}
                step={IMAGE_INTERVAL.step}
                className="pr-20"
                {...register('imageInterval', { valueAsNumber: true })}
              />
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-extra-small text-neutral-text-placeholder">
                {COPY.interval.unit}
              </span>
            </div>
          )}
        </FormField>
      )}

      {placed.length > 0 && (
        <div className="grid gap-4 tablet:grid-cols-2">
          {placed.map(({ slot, index }) => (
            <SlotCard
              key={`${slot.word}-${slot.occurrence}`}
              slot={slot}
              index={index}
              number={numberOf(index)}
              onRemove={() => askRemoveSpot(index)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          removeSpot(removing);
          setRemoving(null);
        }}
        title={COPY.deleteSpotTitle}
        description={removing !== null ? COPY.deleteSpotText(imageSlots[removing]?.word) : ''}
        confirmLabel={COPY.deleteSpotConfirm}
        cancelLabel={COPY.cancel}
        tone="danger"
        icon={Trash2}
      />
    </div>
  );
}

const imageKey = (image) => image.publicId || image.url;

/** One image spot: its rotating images (drag to reorder), add from the library or upload, remove. */
function SlotCard({ slot, index, number, onRemove }) {
  const { setValue, getValues } = useFormContext();
  const [picking, setPicking] = useState(false);
  const { images } = slot;
  const room = LIMITS.slotImages - images.length;

  const setImages = (next) => setValue(`imageSlots.${index}.images`, next, { shouldDirty: true });
  // Reads the latest images: uploads finish after the render that started them.
  const addImages = (items) => {
    const current = getValues(`imageSlots.${index}.images`) ?? [];
    const known = new Set(current.map(imageKey));
    const fresh = items.map((item) => libraryImage(item)).filter((image) => !known.has(imageKey(image)));
    setImages([...current, ...fresh].slice(0, LIMITS.slotImages));
  };
  const picker = useFilePicker({ kind: 'image', messages: MEDIA_LABELS.fileErrors, multiple: true, max: room, onUploaded: addImages });
  const ids = images.map(imageKey);

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-tile bg-neutral-surface-raised p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate text-small font-semi-bold text-text-primary">{COPY.spotTitle(number, slot.word)}</h3>
          <p className="text-extra-small text-neutral-text-placeholder">
            {COPY.tilt(number)} · {COPY.count(images.length)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={COPY.deleteSpot}
          className={adminButton({ variant: 'secondary', size: 'icon', className: 'size-9 hover:text-status-error' })}
        >
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>

      {images.length ? (
        <SortableList
          ids={ids}
          layout="grid"
          as="ul"
          onMove={(from, to) => setImages(arrayMove(images, from, to))}
          labelOf={(id) => COPY.imageLabel(ids.indexOf(id) + 1)}
          labels={COPY}
          className="grid grid-cols-3 gap-2"
        >
          {images.map((image, position) => (
            <SortableTile key={imageKey(image)} id={imageKey(image)} handleLabel={COPY.moveImage(position + 1)}>
              <img
                src={cldUrl(image.url, { width: 240 })}
                alt={image.alt}
                className="aspect-4/3 w-full rounded-md bg-neutral-surface-control object-cover object-top"
              />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, current) => current !== position))}
                aria-label={COPY.removeImage(position + 1)}
                className={cn(
                  'absolute top-1 right-1 flex size-6 items-center justify-center rounded-sm bg-bg-primary/70 text-neutral-text-muted backdrop-blur-glass transition-colors hover:text-status-error',
                  FOCUS_RING,
                )}
              >
                <X aria-hidden className="size-3.5" />
              </button>
            </SortableTile>
          ))}
        </SortableList>
      ) : (
        <p className="flex items-start gap-2 rounded-md bg-status-warning/6 px-3 py-2.5 text-extra-small text-status-warning">
          <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
          {COPY.noImages}
        </p>
      )}

      {room > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setPicking(true)} className={adminButton({ variant: 'secondary', size: 'sm' })}>
            {COPY.addImages}
          </button>
          <button
            type="button"
            onClick={picker.open}
            disabled={picker.uploading}
            aria-busy={picker.uploading || undefined}
            className={adminButton({ variant: 'secondary', size: 'sm' })}
          >
            {picker.uploading ? (
              <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />
            ) : (
              <Upload aria-hidden className="size-4" />
            )}
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

      <MediaPickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        kind="image"
        multiple
        max={room}
        onSelect={addImages}
        labels={MEDIA_LABELS}
      />
    </div>
  );
}
