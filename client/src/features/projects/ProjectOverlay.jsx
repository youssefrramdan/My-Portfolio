import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import Contact from '@/features/contact/Contact';
import { EASE, PROJECT_OVERLAY } from '@/lib/motion';
import { useNavLinks } from '@/lib/useRenderedSections';
import { PROJECT_TEXT } from './labels';
import ProjectActions from './ProjectActions';
import ProjectDetails from './ProjectDetails';
import { ProjectDetailsSkeleton, ProjectMissing } from './ProjectStates';

const TITLE_ID = 'project-overlay-title';
/** Ids of the contact section inside the overlay (the home one is still mounted underneath). */
const CONTACT_IDS = { section: 'project-contact', title: 'project-contact-title' };

/**
 * The project over the blurred home (Figma 549:18363), opened from a card; Contact + Footer sit on a solid
 * background. The page it was opened from stays
 * mounted (and inert) underneath, so closing (X, Esc, browser back) returns to the same scroll position. Section links of the navbar,
 * footer or contact buttons close the overlay first, then scroll the home to that section.
 */
export default function ProjectOverlay({ query }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const links = useNavLinks();
  const scrollRef = useRef(null);
  const titleRef = useRef(null);
  const { data: project, isPending, isError } = query;

  const close = useCallback(
    (hash) => {
      if (hash) {
        const scrollHome = () =>
          setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 50);
        window.addEventListener('popstate', scrollHome, { once: true });
      }
      navigate(-1);
    },
    [navigate, reduce],
  );

  useOverlayEffects({ close });

  useEffect(() => {
    if (project) titleRef.current?.focus({ preventScroll: true });
  }, [project]);

  const backToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: PROJECT_OVERLAY.fade, ease: EASE }}
      className="fixed inset-0 z-40"
    >
      <div aria-hidden className="absolute inset-0 bg-bg-primary/70 backdrop-blur-xl" />

      <div ref={scrollRef} className="relative h-full overflow-y-auto overscroll-contain scheme-dark">
        <motion.div
          initial={reduce ? false : { y: PROJECT_OVERLAY.rise }}
          animate={{ y: 0 }}
          transition={{ duration: PROJECT_OVERLAY.duration, ease: EASE }}
        >
          <div className="min-h-dvh pt-36 pb-28 xl:pt-38.75">
            {isPending ? (
              <ProjectDetailsSkeleton />
            ) : isError || !project ? (
              <ProjectMissing />
            ) : (
              <ProjectDetails project={project} titleId={TITLE_ID} titleRef={titleRef} />
            )}
          </div>
          <div className="bg-bg-primary">
            <Contact sectionId={CONTACT_IDS.section} titleId={CONTACT_IDS.title} />
            <Footer links={links} onBackToTop={backToTop} />
          </div>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={() => close()}
        aria-label={PROJECT_TEXT.close}
        className="absolute top-24 right-grid-margin z-10 flex size-12 items-center justify-center rounded-full bg-neutral-surface-2/80 text-text-primary outline-none backdrop-blur-glass transition-colors hover:bg-neutral-surface-2 focus-visible:ring-2 focus-visible:ring-fill-primary tablet:right-12.5 xl:top-28"
      >
        <X aria-hidden className="size-6" />
      </button>

      {project && <ProjectActions project={project} className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2" />}
    </motion.div>
  );
}

/**
 * While the overlay is open: the page behind does not scroll, Esc closes it, section (`#id`) links anywhere close it
 * and then scroll the home, and focus goes back to the card that opened it.
 */
function useOverlayEffects({ close }) {
  useEffect(() => {
    const opener = document.activeElement;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) close();
    };
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const anchor = event.target.closest?.('a[href^="#"]');
      const hash = anchor?.getAttribute('href').slice(1);
      if (!hash) return;
      event.preventDefault();
      close(hash);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClick);
      root.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [close]);
}
