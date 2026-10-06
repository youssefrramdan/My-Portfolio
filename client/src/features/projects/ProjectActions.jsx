import { ArrowUpRight, Download } from 'lucide-react';
import { DEFAULT_PAGE_BUTTONS } from '@shared/work';
import { useSettings } from '@/features/settings/useSettings';
import { ctaContext, ctaLink } from '@/lib/cta';
import { cn } from '@/lib/utils';
import { PROJECT_TEXT } from './labels';

const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' };
const BUTTON =
  'inline-flex h-11.5 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-small font-medium whitespace-nowrap outline-none transition-[background-color,opacity] duration-200 focus-visible:ring-2 focus-visible:ring-fill-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary';
const PRIMARY = 'bg-fill-primary text-on-brand hover:opacity-90';
const SECONDARY = 'bg-neutral-surface-2 text-text-primary hover:bg-neutral-surface-1';

/**
 * Figma "ActionBar" (549:20638): floating glass pill with the page buttons from Work "Main details"
 * (`project.pageButtons`: email, WhatsApp, CV, link or section, the first one green) and, when the project has one,
 * its external link. Buttons with nothing to point at are left out; nothing renders without any. With more than two
 * buttons, the CV button shows only its icon on phones.
 */
export default function ProjectActions({ project, className }) {
  const { data: settings } = useSettings();
  const context = ctaContext(settings);
  const buttons = (project.pageButtons ?? DEFAULT_PAGE_BUTTONS)
    .map((cta) => ({ action: cta.action, link: ctaLink(cta, context) }))
    .filter((button) => button.link);
  const external = project.externalLink;
  const compact = buttons.length + (external ? 1 : 0) > 2;

  if (!buttons.length && !external) return null;

  return (
    <nav
      aria-label={PROJECT_TEXT.actions}
      className={cn(
        'flex max-w-[calc(100vw-2rem)] gap-2.5 rounded-full border border-border-primary/80 bg-bg-primary/82 p-2 shadow-[0_16px_56px_0_rgb(0_0_0/0.38)] backdrop-blur-lg',
        className,
      )}
    >
      {buttons.map(({ action, link: { label, ...props } }, position) => {
        const iconOnly = compact && action === 'cv';
        return (
          <a
            key={position}
            {...props}
            aria-label={iconOnly ? label : undefined}
            className={cn(BUTTON, position === 0 ? PRIMARY : SECONDARY, iconOnly && 'max-tablet:px-3.5')}
          >
            <span className={cn(iconOnly && 'max-tablet:sr-only')}>{label}</span>
            {action === 'cv' ? <Download aria-hidden className="size-5" /> : <ArrowUpRight aria-hidden className="size-5" />}
          </a>
        );
      })}
      {external && (
        <a href={external} {...NEW_TAB} className={cn(BUTTON, buttons.length ? SECONDARY : PRIMARY)}>
          {project.linkLabel}
          <ArrowUpRight aria-hidden className="size-5" />
        </a>
      )}
    </nav>
  );
}
