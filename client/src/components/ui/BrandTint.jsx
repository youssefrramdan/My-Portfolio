import { cn } from '@/lib/utils';

/**
 * A decor image recolored to the brand color: grayscale keeps its light and shape, a `mix-blend-color` layer gives
 * it the brand hue (white highlights stay white, dark areas stay dark). Decorative only.
 */
export default function BrandTint({ src, className, imgClassName }) {
  return (
    <span aria-hidden className={cn('relative isolate block', className)}>
      <img src={src} alt="" draggable={false} className={cn('block grayscale select-none', imgClassName)} />
      <span className="absolute inset-0 bg-brand-color mix-blend-color" />
    </span>
  );
}
