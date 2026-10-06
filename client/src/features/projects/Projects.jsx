import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import { REVEAL, revealOnScroll, UNFOLD, useReveal, VIEW_SWITCH } from '@/lib/motion';
import { SECTION } from '@/lib/sections';
import { MEDIA, useMediaQuery } from '@/lib/useMediaQuery';
import { useDragScroll } from '@/lib/useDragScroll';
import { cn } from '@/lib/utils';
import { PROJECT_TEXT } from './labels';
import ProjectCard from './ProjectCard';
import ProjectsSkeleton from './ProjectsSkeleton';
import { useProjects } from './useProjects';
import { useStackUnfold } from './useStackUnfold';
import ViewToggle from './ViewToggle';

/** Stagger order of the reveal: header items, the toggle, then the cards. */
const ORDER = { toggle: 4, firstCard: 5 };

export default function Projects() {
  const { data, isPending, isError } = useProjects();

  if (isPending) return <ProjectsSkeleton />;
  const projects = data?.projects ?? [];
  if (isError || !projects.length) return null;

  return <ProjectsSection section={data.section} projects={projects} />;
}

/**
 * "Selected Projects". Mobile: header + card carousel. Tablet: centered header, Row (carousel) or Grid.
 * Desktop (xl): a tall section whose sticky stage unfolds the card stack into the Row while scrolling;
 * Grid turns the sticky stage off. Reduced motion shows the Row directly.
 */
function ProjectsSection({ section, projects }) {
  const reduce = useReducedMotion();
  const reveal = useReveal();
  const isTablet = useMediaQuery(MEDIA.tablet);
  const isXl = useMediaQuery(MEDIA.xl);
  const [view, setView] = useState('row');
  const [shift, setShift] = useState(0);
  const settling = useRef(null);

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const itemRefs = useRef([]);
  const cardItemRefs = useRef([]);
  const refs = useMemo(
    () => ({
      section: sectionRef,
      stage: stageRef,
      frame: frameRef,
      header: headerRef,
      items: itemRefs,
      cards: cardsRef,
      cardItems: cardItemRefs,
    }),
    [],
  );

  const grid = isTablet && view === 'grid';
  const unfold = isXl && !reduce && !grid;
  const { values, fit, unfolded, endScroll } = useStackUnfold({ enabled: unfold, refs, count: projects.length });
  useDragScroll(cardsRef, !grid && (!unfold || unfolded));
  const atEnd = useRowEnd(cardsRef, !grid, projects.length);

  const layout = !reduce;
  const rise = reveal({ y: REVEAL.rise });

  /**
   * On desktop the section changes height between Row (tall, sticky) and Grid (natural). The section is first
   * offset so nothing moves on screen while the layout animation runs, then the offset is traded for the
   * same page scroll in one frame.
   */
  const changeView = (next) => {
    if (settling.current) return;
    if (isXl && !reduce) {
      const element = sectionRef.current;
      const sectionTop = element.getBoundingClientRect().top + window.scrollY;
      // To Grid: keep the header where it is on screen. To Row: land on the unfolded end of the track.
      const headerTop = headerRef.current.getBoundingClientRect().top;
      const stagePadding = parseFloat(getComputedStyle(stageRef.current).paddingTop);
      const offset =
        next === 'grid'
          ? window.scrollY + headerTop - stagePadding - sectionTop
          : -(UNFOLD.track * window.innerHeight + Math.max(0, sectionTop - window.scrollY));
      setShift(offset);
      settling.current = setTimeout(() => {
        // Read first: removing the offset can shorten the page and clamp the scroll position.
        const scrollTop = window.scrollY;
        element.style.marginTop = '0px';
        window.scrollTo({ top: scrollTop - offset, behavior: 'instant' });
        setShift(0);
        settling.current = null;
      }, VIEW_SWITCH.duration * 1000 + 100);
    }
    setView(next);
  };

  const scrollToEnd = () => {
    const row = cardsRef.current;
    row?.scrollTo({ left: row.scrollWidth, behavior: reduce ? 'auto' : 'smooth' });
  };

  const explore = () => {
    const behavior = reduce ? 'auto' : 'smooth';
    if (unfold) window.scrollTo({ top: endScroll(), behavior });
    else cardsRef.current?.scrollIntoView({ behavior, block: 'center' });
  };

  const items = [
    section?.badge && { key: 'badge', node: <Badge>{section.badge}</Badge> },
    section?.title?.plain && {
      key: 'title',
      node: (
        <SectionTitle
          id="projects-title"
          plain={section.title.plain}
          highlight={section.title.highlight}
          className="text-h1 desktop:font-black"
        />
      ),
    },
    section?.description && {
      key: 'description',
      className: 'relative w-full max-w-152.5',
      node: (
        <>
          <motion.p style={values.descriptionCenter} className="text-large text-text-secondary">
            {section.description}
          </motion.p>
          {/* Left-aligned copy for the stack state: crossfades with the centered one as the block moves. */}
          {unfold && (
            <motion.p
              aria-hidden
              style={values.descriptionLeft}
              className="absolute inset-0 text-left text-large text-text-secondary"
            >
              {section.description}
            </motion.p>
          )}
        </>
      ),
    },
    section?.scrollButtonLabel && {
      key: 'button',
      node: (
        <Button onClick={explore} icon={<ArrowUpRight className="size-6 rotate-135" />}>
          {section.scrollButtonLabel}
        </Button>
      ),
    },
  ].filter(Boolean);

  return (
    <section
      ref={sectionRef}
      id={SECTION.projects}
      aria-labelledby={section?.title?.plain ? 'projects-title' : undefined}
      className="relative bg-bg-primary"
      style={{ height: unfold ? `${(1 + UNFOLD.track) * 100}dvh` : undefined, marginTop: shift || undefined }}
    >
      <motion.div
        ref={stageRef}
        className={cn('overflow-hidden py-space-5', unfold && 'sticky top-0 h-dvh')}
        {...revealOnScroll}
      >
        <div
          ref={frameRef}
          style={unfold && fit ? { top: fit.top, width: `${100 / fit.scale}%`, scale: String(fit.scale) } : undefined}
          className={cn('flex w-full flex-col gap-space-5 tablet:gap-4', unfold && 'absolute left-0 origin-top-left')}
        >
          <motion.header layout={layout}>
            <motion.div
              ref={headerRef}
              style={values.header}
              className="flex flex-col items-start gap-4 px-grid-margin text-left tablet:items-center tablet:text-center"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.key}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  style={values.items[index]}
                  className={item.className}
                >
                  <motion.div variants={rise} custom={index}>
                    {item.node}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.header>

          {isTablet && (
            <motion.div layout={layout} className="flex justify-end px-grid-margin">
              {/* Own trigger: the toggle mounts later than the section reveal when crossing the tablet breakpoint. */}
              <motion.div variants={rise} custom={ORDER.toggle} {...revealOnScroll}>
                <ViewToggle
                  value={view}
                  onChange={changeView}
                  style={values.toggle}
                  inert={unfold && !unfolded}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Grid overlay (not positioned) so the side arrow sits over the row without changing its offsetParent. */}
          <div className="grid">
            <div
              ref={cardsRef}
              className={cn(
                '[grid-area:1/1]',
                grid
                  ? 'relative grid grid-cols-2 gap-4 px-grid-margin xl:grid-cols-3'
                  : 'relative -my-2 flex snap-x snap-mandatory scroll-px-grid-margin gap-4 overflow-x-auto px-grid-margin py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                // Room for the stacked cards above the row (a scroller clips both axes); clicks pass through it.
                unfold && 'pointer-events-none -my-60 py-60',
                unfold && !unfolded && 'overflow-x-hidden',
              )}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.slug}
                  layout={layout}
                  ref={(element) => {
                    cardItemRefs.current[index] = element;
                  }}
                  className={cn(
                    !grid && 'w-80 max-w-[calc(100vw-3rem)] shrink-0 snap-start tablet:w-96 xl:w-116',
                    unfold && 'pointer-events-auto',
                  )}
                >
                  <motion.div style={values.cards[index]} className="h-full">
                    <motion.div variants={rise} custom={ORDER.firstCard + index} className="h-full">
                      <ProjectCard project={project} ctaLabel={section?.cardCtaLabel} />
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
              <motion.div
                layout={layout}
                style={values.toggle}
                inert={unfold && !unfolded}
                className={cn(!grid && 'w-40 shrink-0 snap-start tablet:w-48', unfold && 'pointer-events-auto')}
              >
                <motion.div variants={rise} custom={ORDER.firstCard + projects.length} className="h-full">
                  <AllProjectsTile />
                </motion.div>
              </motion.div>
            </div>

            {!grid && (
              <motion.div
                style={values.toggle}
                inert={(unfold && !unfolded) || atEnd}
                className="pointer-events-none z-10 flex items-center justify-end pr-grid-margin [grid-area:1/1]"
              >
                <button
                  type="button"
                  onClick={scrollToEnd}
                  aria-label={PROJECT_TEXT.scrollToEnd}
                  className={cn(
                    'flex size-12 items-center justify-center rounded-full bg-neutral-surface-2/80 text-text-primary shadow-[0_8px_24px_0_rgb(0_0_0/0.35)] outline-none backdrop-blur-glass transition-[opacity,background-color,color] duration-300 hover:bg-fill-primary hover:text-on-brand focus-visible:ring-2 focus-visible:ring-fill-primary',
                    atEnd ? 'opacity-0' : 'pointer-events-auto',
                  )}
                >
                  <ArrowRight aria-hidden className="size-6" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/** Pixels of slack when checking the row end (snap points and sub-pixel widths rarely land exactly on it). */
const END_SLACK = 8;

/**
 * Whether the card row is scrolled to its end (or does not scroll at all): the side arrow then hides and the
 * "View all projects" tile at the end of the row takes over.
 */
function useRowEnd(ref, enabled, count) {
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const row = ref.current;
    if (!enabled || !row) return undefined;
    const update = () => setAtEnd(row.scrollLeft + row.clientWidth >= row.scrollWidth - END_SLACK);
    const resize = new ResizeObserver(update);
    resize.observe(row);
    row.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      resize.disconnect();
      row.removeEventListener('scroll', update);
    };
  }, [ref, enabled, count]);

  return atEnd;
}

/** Last item of the row / grid: opens the all-projects page. */
function AllProjectsTile() {
  return (
    <Link
      to="/projects"
      draggable={false}
      className="group flex h-full min-h-48 flex-col items-center justify-center gap-3 rounded-xl bg-neutral-surface-0 p-space-3 text-center text-small font-medium text-text-primary ring-2 ring-transparent outline-none ring-inset transition-shadow duration-300 ease-out hover:ring-brand-color focus-visible:ring-brand-color"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-fill-primary text-on-brand transition-transform duration-300 ease-out group-hover:translate-x-1">
        <ArrowRight aria-hidden className="size-6" />
      </span>
      {PROJECT_TEXT.viewAll}
    </Link>
  );
}
