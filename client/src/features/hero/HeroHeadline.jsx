import { Fragment } from 'react';
import { anchorIndex, titleWords } from '@shared/identity';
import { cn } from '@/lib/utils';
import RotatingImage from './RotatingImage';

export const HEADLINE_IMAGE_SIZE =
  'h-7 w-9.5 border-2 tablet:h-10.5 tablet:w-14 tablet:border-3 desktop:h-14 desktop:w-19 desktop:border-4';

/** Image spots tilt in turn, left to right. */
const TILTS = ['rotate-12', '-rotate-15'];

/**
 * Hero title from Identity: each image spot hangs after the word it is anchored to (`{ word, occurrence }`) and
 * shows its images one after another every `interval` seconds; the line break (tablet+) comes after its word. Anchors that no longer match are skipped.
 * The dashboard preview reuses it with `as`, `className` and `imageClassName`.
 */
export default function HeroHeadline({
  title,
  lineBreak,
  imageSlots = [],
  interval,
  as: Tag = 'h1',
  className = 'text-h1',
  imageClassName = HEADLINE_IMAGE_SIZE,
}) {
  const words = titleWords(title);
  if (!words.length) return null;

  const imagesAt = new Map();
  for (const slot of imageSlots) {
    const index = anchorIndex(words, slot);
    if (index !== -1 && slot.images?.length) imagesAt.set(index, slot.images);
  }
  const slotOrder = [...imagesAt.keys()].sort((a, b) => a - b);
  const breakAt = anchorIndex(words, lineBreak);

  return (
    <Tag
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-2 text-center font-black text-text-brand',
        className,
      )}
    >
      {words.map((word, index) => (
        <Fragment key={index}>
          {imagesAt.has(index) ? (
            <span className="inline-flex items-center gap-x-2 whitespace-nowrap">
              {word}
              <span aria-hidden className="flex">
                <RotatingImage
                  images={imagesAt.get(index)}
                  interval={interval}
                  className={cn(TILTS[slotOrder.indexOf(index) % TILTS.length], imageClassName)}
                />
              </span>
            </span>
          ) : (
            <span>{word}</span>
          )}{' '}
          {index === breakAt && <span aria-hidden className="hidden basis-full tablet:block" />}
        </Fragment>
      ))}
    </Tag>
  );
}
