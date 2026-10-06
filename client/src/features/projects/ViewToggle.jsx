import { motion, useReducedMotion } from 'framer-motion';
import { VIEW_SWITCH } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Hugeicons "grid-view" (stroke rounded), as used in the Figma toggle. */
function GridViewIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...props}>
      <path d="M3.88884 9.66294C4.39329 10 5.09552 10 6.49998 10C7.90445 10 8.60668 10 9.11113 9.66294C9.32951 9.51702 9.51701 9.32952 9.66292 9.11114C9.99998 8.60669 9.99998 7.90446 9.99998 6.5C9.99998 5.09554 9.99998 4.39331 9.66292 3.88886C9.51701 3.67048 9.32951 3.48298 9.11113 3.33706C8.60668 3 7.90445 3 6.49998 3C5.09552 3 4.39329 3 3.88884 3.33706C3.67046 3.48298 3.48296 3.67048 3.33705 3.88886C2.99998 4.39331 2.99998 5.09554 2.99998 6.5C2.99998 7.90446 2.99998 8.60669 3.33705 9.11114C3.48296 9.32952 3.67046 9.51702 3.88884 9.66294Z" />
      <path d="M14.8888 9.66294C15.3933 10 16.0955 10 17.5 10C18.9044 10 19.6067 10 20.1111 9.66294C20.3295 9.51702 20.517 9.32952 20.6629 9.11114C21 8.60669 21 7.90446 21 6.5C21 5.09554 21 4.39331 20.6629 3.88886C20.517 3.67048 20.3295 3.48298 20.1111 3.33706C19.6067 3 18.9044 3 17.5 3C16.0955 3 15.3933 3 14.8888 3.33706C14.6705 3.48298 14.483 3.67048 14.337 3.88886C14 4.39331 14 5.09554 14 6.5C14 7.90446 14 8.60669 14.337 9.11114C14.483 9.32952 14.6705 9.51702 14.8888 9.66294Z" />
      <path d="M3.88884 20.6629C4.39329 21 5.09552 21 6.49998 21C7.90445 21 8.60668 21 9.11113 20.6629C9.32951 20.517 9.51701 20.3295 9.66292 20.1111C9.99998 19.6067 9.99998 18.9045 9.99998 17.5C9.99998 16.0955 9.99998 15.3933 9.66292 14.8889C9.51701 14.6705 9.32951 14.483 9.11113 14.3371C8.60668 14 7.90445 14 6.49998 14C5.09552 14 4.39329 14 3.88884 14.3371C3.67046 14.483 3.48296 14.6705 3.33705 14.8889C2.99998 15.3933 2.99998 16.0955 2.99998 17.5C2.99998 18.9045 2.99998 19.6067 3.33705 20.1111C3.48296 20.3295 3.67046 20.517 3.88884 20.6629Z" />
      <path d="M14.8888 20.6629C15.3933 21 16.0955 21 17.5 21C18.9044 21 19.6067 21 20.1111 20.6629C20.3295 20.517 20.517 20.3295 20.6629 20.1111C21 19.6067 21 18.9045 21 17.5C21 16.0955 21 15.3933 20.6629 14.8889C20.517 14.6705 20.3295 14.483 20.1111 14.3371C19.6067 14 18.9044 14 17.5 14C16.0955 14 15.3933 14 14.8888 14.3371C14.6705 14.483 14.483 14.6705 14.337 14.8889C14 15.3933 14 16.0955 14 17.5C14 18.9045 14 19.6067 14.337 20.1111C14.483 20.3295 14.6705 20.517 14.8888 20.6629Z" />
    </svg>
  );
}

/** Hugeicons "distribute-horizontal-right" (stroke rounded), the Figma row icon. */
function RowViewIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 2V22" />
      <path d="M10 2V22" />
      <path d="M16.5 8.00232C17.3439 8.00232 18.3179 7.91895 18.799 8.75232C19 9.10039 19 9.5677 19 10.5023V13.5023C19 14.4369 19 14.9042 18.799 15.2523C18.3179 16.0857 17.3439 16.0023 16.5 16.0023C15.6561 16.0023 14.6821 16.0857 14.201 15.2523C14 14.9042 14 14.4369 14 13.5023L14 10.5023C14 9.5677 14 9.10039 14.201 8.75232C14.6821 7.91895 15.6561 8.00232 16.5 8.00232Z" />
      <path d="M4.5 5.00232C5.34389 5.00232 6.31789 4.91895 6.79904 5.75232C7 6.10039 7 6.5677 7 7.50232L7 16.5023C7 17.4369 7 17.9042 6.79904 18.2523C6.31789 19.0857 5.34389 19.0023 4.5 19.0023C3.65611 19.0023 2.68211 19.0857 2.20096 18.2523C2 17.9042 2 17.4369 2 16.5023L2 7.50232C2 6.5677 2 6.10039 2.20096 5.75232C2.68211 4.91895 3.65611 5.00232 4.5 5.00232Z" />
    </svg>
  );
}

export const VIEWS = [
  { id: 'grid', label: 'Grid view', Icon: GridViewIcon },
  { id: 'row', label: 'Row view', Icon: RowViewIcon },
];

/** Grid / Row switch (Figma "Frame 7271"): the green pill slides to the active view. */
export default function ViewToggle({ value, onChange, className, ...props }) {
  const reduce = useReducedMotion();

  return (
    <motion.div role="radiogroup" aria-label="Projects layout" className={cn('flex items-center', className)} {...props}>
      {VIEWS.map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => !active && onChange(id)}
            className="relative flex items-center justify-center rounded-sm px-3.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-color"
          >
            {active && (
              <motion.span
                layoutId="projects-view-pill"
                transition={reduce ? { duration: 0 } : VIEW_SWITCH}
                className="absolute inset-0 rounded-sm bg-brand-color"
              />
            )}
            <Icon
              aria-hidden
              className={cn(
                'relative size-6 transition-colors duration-300 ease-out',
                active ? 'text-neutral-surface-black' : 'text-text-secondary hover:text-text-primary',
              )}
            />
          </button>
        );
      })}
    </motion.div>
  );
}
