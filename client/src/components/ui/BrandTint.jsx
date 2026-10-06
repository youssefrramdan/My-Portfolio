import { cn } from '@/lib/utils';

/**
 * A decor image recolored to the brand color: grayscale keeps its light and shape, a `mix-blend-color` layer gives
 * it the brand hue (white highlights stay white). The decor JPGs carry the section background (~#191b18, luminance
 * 0.10); `contrast-135` pushes it to pure black, which the color layer keeps black and the parent's
 * `mix-blend-lighten` drops, so no tinted box shows around the light. Decorative only.
 */
export default function BrandTint({ src, className, imgClassName }) {
  return (
    <span aria-hidden className={cn('relative isolate block', className)}>
      <img src={src} alt="" draggable={false} className={cn('block grayscale contrast-135 select-none', imgClassName)} />
      <span className="absolute inset-0 bg-brand-color mix-blend-color" />
    </span>
  );
}
