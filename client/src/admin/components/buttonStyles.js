import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-fill-primary text-on-brand hover:bg-fill-primary/90',
  secondary: 'bg-neutral-surface-control text-neutral-text-muted hover:bg-neutral-surface-input hover:text-text-primary',
  raised: 'bg-neutral-surface-raised text-text-primary hover:bg-neutral-surface-control',
};

const SIZES = {
  md: 'h-12 px-5',
  sm: 'h-11 px-4',
  icon: 'size-10',
};

/**
 * Classes for admin action buttons (Figma Dashboard buttons: filled, rounded rectangle, icon + label),
 * so the same look applies to `<button>`, `<a>` and router `<Link>`.
 */
export function adminButton({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-base font-medium whitespace-nowrap outline-none',
    'transition-colors duration-200',
    'focus-visible:ring-2 focus-visible:ring-fill-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
    'disabled:cursor-not-allowed disabled:opacity-60 aria-busy:cursor-progress',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

/** Focus ring for other clickable admin surfaces (tiles, cards, nav items). */
export const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-fill-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary';
