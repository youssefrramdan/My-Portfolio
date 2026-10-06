import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EMPTY_DETAIL } from './labels';

/**
 * Mobile: number, then title / "issuer · detail" / date stacked. Tablet: the date moves to the right.
 * xl: the Figma 4-column row (title, issuer, detail, date); `xl:contents` lets the nested wrappers
 * dissolve so every part becomes a column of the same flex row.
 * An empty detail is hidden on mobile and shown as a dash from tablet up. With a `link`, the title opens it.
 */
export default function CertificateRow({ certificate, number, ...motionProps }) {
  const { title, issuer, detail, date, link } = certificate;

  return (
    <motion.li
      className="flex items-start gap-space-3 border-t border-neutral-gray/50 py-4 first:border-t-0 xl:items-center xl:gap-6"
      {...motionProps}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-neutral-surface-black text-base font-bold text-text-brand">
        {String(number).padStart(2, '0')}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-space-1 tablet:flex-row tablet:items-center tablet:gap-space-3 xl:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-space-1 xl:contents">
          <p className="text-large font-semi-bold text-text-primary xl:flex-1">
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-sm outline-none transition-colors hover:text-text-brand focus-visible:ring-2 focus-visible:ring-fill-primary"
              >
                {title}
                <ArrowUpRight aria-hidden className="size-4 shrink-0 text-text-brand transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              title
            )}
          </p>
          <p className="text-base text-text-secondary xl:contents">
            <span className="font-semi-bold xl:w-41 xl:shrink-0 xl:text-center">{issuer}</span>
            <span aria-hidden className={cn('xl:hidden', !detail && 'hidden tablet:inline')}>
              {' · '}
            </span>
            <span className={cn('xl:w-41 xl:shrink-0 xl:text-right', !detail && 'hidden tablet:inline')}>
              {detail || EMPTY_DETAIL}
            </span>
          </p>
        </div>
        <p className="text-base font-medium text-text-brand tablet:shrink-0 tablet:text-right xl:w-41">{date}</p>
      </div>
    </motion.li>
  );
}
