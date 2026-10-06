import { motion, useReducedMotion } from 'framer-motion';
import { SOCIAL_HOVER } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { SOCIAL_PLATFORMS, VIEWBOX } from './socialPlatforms';

/**
 * Round social link (Figma social icon): white brand glyph on a dark circle. Hover: green circle, dark glyph,
 * slight lift. The circle size comes from `className`; the glyph scales with it. Unknown platforms render nothing.
 */
export default function SocialIcon({ social, className, ...props }) {
  const reduce = useReducedMotion();
  const platform = SOCIAL_PLATFORMS[social.platform];
  if (!platform) return null;

  return (
    <motion.a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={platform.label}
      whileHover={reduce ? undefined : { y: SOCIAL_HOVER.lift }}
      whileFocus={reduce ? undefined : { y: SOCIAL_HOVER.lift }}
      transition={{ duration: SOCIAL_HOVER.duration, ease: SOCIAL_HOVER.ease }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-neutral-surface-0 text-neutral outline-none transition-colors duration-300',
        'hover:bg-fill-primary hover:text-on-brand focus-visible:bg-fill-primary focus-visible:text-on-brand',
        className,
      )}
      {...props}
    >
      <svg viewBox={VIEWBOX} fill="currentColor" aria-hidden className="size-full">
        {platform.paths.map((path) => (
          <path
            key={path.d.slice(0, 24)}
            d={path.d}
            fillRule={path.evenOdd ? 'evenodd' : undefined}
            clipRule={path.evenOdd ? 'evenodd' : undefined}
          />
        ))}
      </svg>
    </motion.a>
  );
}
