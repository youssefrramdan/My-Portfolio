import { AnimatePresence, motion } from 'framer-motion';
import { Download, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useSettings } from '@/features/settings/useSettings';
import { cldUrl } from '@/lib/cloudinary';
import { cvLinkProps } from '@/lib/download';
import { DISTANCE, EASE, MENU, useEntrance } from '@/lib/motion';
import { NAV_LINKS } from '@/lib/sections';
import { useActiveSection } from '@/lib/useActiveSection';
import { cn } from '@/lib/utils';

const HOME_LABEL = 'Back to home';

/** `home` set: a route link that opens the home scrolled to the section (`state.section`, see `useLinkedSection`). */
function NavLink({ link, active, home, indicatorId, onClick }) {
  const props = {
    onClick,
    'aria-current': active ? 'true' : undefined,
    className: 'flex h-13 flex-col items-center justify-center gap-1.5',
  };
  const content = (
    <>
      <span
        className={cn(
          'transition-colors',
          active
            ? 'text-base text-text-brand'
            : 'text-small text-text-disabled hover:text-text-primary',
        )}
      >
        {link.label}
      </span>
      <span className="flex h-1.5 items-center">
        {active && (
          <motion.span
            layoutId={indicatorId}
            transition={{ duration: MENU.duration, ease: EASE }}
            className="flex items-center gap-1"
          >
            <span className="size-1.5 rounded-full bg-fill-primary" />
            <span className="h-1.5 w-5 rounded-full bg-fill-primary" />
          </motion.span>
        )}
      </span>
    </>
  );

  if (home) {
    return (
      <Link to={home} state={{ section: link.id }} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <a href={`#${link.id}`} {...props}>
      {content}
    </a>
  );
}

function AvatarLink({ home, children }) {
  const className = 'block size-10 overflow-hidden rounded-full';
  if (home) {
    return (
      <Link to={home} aria-label={HOME_LABEL} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href="#top" className={className}>
      {children}
    </a>
  );
}

/**
 * `links`: the section links to show (Home passes only the sections on the page, in page order).
 * `home`: on other pages, the avatar and the links go to this route (the links scroll it to their section);
 * `current` is then the highlighted link instead of the section in view.
 */
export default function Navbar({ links = NAV_LINKS, home, current }) {
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);
  const entrance = useEntrance();

  const inView = useActiveSection(home ? [] : links.map((link) => link.id));
  const active = home ? current : inView;
  const cvLink = cvLinkProps(settings?.cv);
  const avatar = settings?.avatar;

  return (
    <motion.header
      {...entrance(DISTANCE.navbar)}
      className="fixed inset-x-0 top-0 z-50 bg-bg-primary/50 px-grid-margin backdrop-blur-glass tablet:px-12.5"
    >
      <nav className="relative flex items-center justify-between pt-6 pb-3 tablet:px-8 tablet:py-4">
        {/* Six links only fit inline from xl; below that they live in the menu. */}
        <div className="hidden items-center gap-space-3 xl:flex">
          {links.map((link) => (
            <NavLink key={link.id} link={link} active={active === link.id} home={home} indicatorId="nav-indicator" />
          ))}
        </div>

        <div className="flex tablet:absolute tablet:top-1/2 tablet:left-1/2 tablet:-translate-x-1/2 tablet:-translate-y-1/2">
          {avatar?.url ? (
            <AvatarLink home={home}>
              <img
                src={cldUrl(avatar.url, { width: 120 })}
                alt={avatar.alt}
                width={40}
                height={40}
                className="size-full object-cover"
              />
            </AvatarLink>
          ) : (
            <span className="block size-10 animate-pulse rounded-full bg-card-primary" />
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button
            {...cvLink}
            aria-disabled={cvLink ? undefined : 'true'}
            size="sm"
            icon={<Download className="size-6" />}
          >
            Download CV
          </Button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Menu"
            className="flex size-6 items-center justify-center text-icon-primary xl:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: MENU.duration, ease: EASE }}
            className="flex flex-col items-start gap-space-2 pb-space-4 xl:hidden"
          >
            {links.map((link) => (
              <NavLink
                key={link.id}
                link={link}
                active={active === link.id}
                home={home}
                indicatorId="mobile-nav-indicator"
                onClick={() => setOpen(false)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
