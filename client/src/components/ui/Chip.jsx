import { cn } from '@/lib/utils';

const sizes = {
  md: 'px-4 py-2',
  sm: 'px-3 py-1',
};

/**
 * Small rounded label (Figma "Chips" component set: Default 119:3195, Hover 119:3194).
 * `sm` = the tighter tags of the project cards.
 */
export default function Chip({ size = 'md', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full bg-neutral-surface-section text-extra-small whitespace-nowrap text-neutral transition-colors duration-300 ease-out',
        'hover:bg-brand-color hover:text-neutral-surface-black',
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
