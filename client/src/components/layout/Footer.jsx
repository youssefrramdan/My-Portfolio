import { useReducedMotion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSettings } from '@/features/settings/useSettings';
import { NAV_LINKS } from '@/lib/sections';

/**
 * Site footer (Figma 184:20959 desktop, 403:12603 mobile). From xl: copyright left, links centered,
 * Back Up right. Below xl everything is stacked and centered: links, copyright, Back Up.
 * Links are the navbar links (`links`, the sections on the page); copyright and button label come from settings.
 * `onBackToTop` replaces the window scroll (the project overlay scrolls its own container); `inert` while a
 * project covers the home.
 */
export default function Footer({ links = NAV_LINKS, onBackToTop, inert = false }) {
  const { data: settings } = useSettings();
  const reduce = useReducedMotion();
  const footer = settings?.footer;

  const backToTop = onBackToTop ?? (() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  return (
    <footer inert={inert} className="bg-neutral-surface-0">
      <div className="mx-auto flex max-w-360 flex-col items-center gap-5 px-grid-margin py-8 text-center xl:flex-row xl:gap-8 xl:text-left">
        <p className="text-large text-neutral/87 tablet:text-base xl:flex-1">{footer?.copyright}</p>

        <nav aria-label="Footer" className="order-first xl:order-none">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 xl:gap-x-12">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className="text-base text-neutral/38 transition-colors hover:text-text-primary focus-visible:text-text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex justify-end xl:flex-1">
          {footer?.backToTopLabel && (
            <Button
              onClick={backToTop}
              icon={<ChevronUp className="size-6" />}
              className="bg-surface-secondary text-text-primary"
            >
              {footer.backToTopLabel}
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
