import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { clampImageInterval } from '@shared/identity';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

/**
 * Framed image that jumps to the next image every `interval` seconds, without a transition. Every image is
 * mounted (stacked) so the next one is already loaded when it shows.
 */
export default function RotatingImage({ images = [], interval, className }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const count = images.length;
  const delay = clampImageInterval(interval) * 1000;

  useEffect(() => {
    if (count < 2 || reduce) return undefined;
    const id = setInterval(() => setIndex((current) => (current + 1) % count), delay);
    return () => clearInterval(id);
  }, [count, delay, reduce]);

  if (!count) return null;
  const active = index % count;

  return (
    <span
      className={cn(
        'relative inline-block shrink-0 overflow-hidden rounded-md border-neutral-surface-2 bg-card-primary',
        className,
      )}
    >
      {images.map((image, position) => (
        <img
          key={`${image.url}-${position}`}
          src={cldUrl(image.url, { width: 240 })}
          alt={image.alt}
          className={cn('absolute inset-0 size-full object-cover object-top', position !== active && 'invisible')}
        />
      ))}
    </span>
  );
}
