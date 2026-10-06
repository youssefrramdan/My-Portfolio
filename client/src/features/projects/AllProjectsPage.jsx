import { motion } from 'framer-motion';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import Badge from '@/components/ui/Badge';
import SectionTitle from '@/components/ui/SectionTitle';
import Contact from '@/features/contact/Contact';
import { REVEAL, revealOnScroll, useReveal } from '@/lib/motion';
import { SECTION } from '@/lib/sections';
import { usePageScroll } from '@/lib/usePageScroll';
import { useHomeNavLinks } from '@/lib/useRenderedSections';
import { PROJECT_TEXT } from './labels';
import ProjectCard from './ProjectCard';
import { useAllProjects } from './useProjects';

const TITLE_ID = 'all-projects-title';
const GRID = 'grid gap-4 tablet:grid-cols-2 xl:grid-cols-3';
/** Cards reveal row by row as they scroll in, staggered across the (up to 3) columns. */
const COLUMNS = 3;
const CARD_VIEWPORT = { once: true, amount: 0.2 };

/**
 * `/projects` (Figma "All Projects"): every published project as a grid of cards (the home row shows the featured
 * ones). The title reuses the section title ("All " + it). Cards open the project over this page.
 * `covered` = a project is open on top: the page and footer are inert.
 */
export default function AllProjectsPage({ covered = false }) {
  const { data, isPending, isError } = useAllProjects();
  usePageScroll('/projects');
  const navLinks = useHomeNavLinks();
  const reveal = useReveal();
  const rise = reveal({ y: REVEAL.rise });
  const section = data?.section;
  const projects = data?.projects ?? [];
  const title = section?.title?.plain
    ? { plain: `${PROJECT_TEXT.allPrefix} ${section.title.plain}`, highlight: section.title.highlight }
    : { plain: PROJECT_TEXT.allProjects };

  return (
    <>
      <Navbar links={navLinks} home="/" current={SECTION.projects} />
      <main inert={covered} aria-labelledby={TITLE_ID} className="min-h-dvh px-grid-margin pt-36 pb-20 xl:pt-38.75">
        <div className="mx-auto flex w-full max-w-320 flex-col gap-space-5">
          <motion.header
            {...revealOnScroll}
            className="flex flex-col items-start gap-4 text-left tablet:items-center tablet:text-center"
          >
            <motion.div variants={rise} custom={0}>
              <Badge>{PROJECT_TEXT.allProjects}</Badge>
            </motion.div>
            <motion.div variants={rise} custom={1}>
              <SectionTitle as="h1" id={TITLE_ID} {...title} className="text-h1 desktop:font-black" />
            </motion.div>
            {/* Own trigger: it mounts with the data, after the header reveal has already played. */}
            {section?.description && (
              <motion.p
                {...revealOnScroll}
                variants={rise}
                custom={2}
                className="max-w-152.5 text-large text-text-secondary"
              >
                {section.description}
              </motion.p>
            )}
          </motion.header>

          {isPending ? (
            <div role="status" className={GRID}>
              <span className="sr-only">{PROJECT_TEXT.loadingAll}</span>
              {Array.from({ length: 6 }, (_, index) => (
                <span key={index} aria-hidden className="h-80 animate-pulse rounded-xl bg-card-primary xl:h-93" />
              ))}
            </div>
          ) : isError || !projects.length ? (
            <p className="text-large text-text-secondary tablet:text-center">{PROJECT_TEXT.noProjects}</p>
          ) : (
            <ul className={GRID}>
              {projects.map((project, index) => (
                <motion.li
                  key={project.slug}
                  {...revealOnScroll}
                  viewport={CARD_VIEWPORT}
                  variants={rise}
                  custom={index % COLUMNS}
                  className="h-full"
                >
                  <ProjectCard project={project} ctaLabel={section?.cardCtaLabel} />
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Contact />
      <Footer links={[]} inert={covered} />
    </>
  );
}
