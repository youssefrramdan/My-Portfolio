import { motion } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import SectionTitle from '@/components/ui/SectionTitle';
import { EDUCATION_REVEAL, REVEAL, revealOnScroll, useReveal } from '@/lib/motion';
import { SECTION } from '@/lib/sections';
import { MEDIA, useMediaQuery } from '@/lib/useMediaQuery';
import CertificatesCard from './CertificatesCard';
import DegreeCard from './DegreeCard';
import EducationSkeleton from './EducationSkeleton';
import GraduationCard from './GraduationCard';
import { useEducation } from './useEducation';

/** Stagger order inside each reveal group. */
const ORDER = { badge: 0, title: 1, description: 2, degree: 0, graduation: 1 };

/** Figma divider above the heading: two lines fading out from a small green light in the center. */
function SectionDivider() {
  return (
    <div aria-hidden className="mx-auto flex w-full max-w-210.5 items-center px-grid-margin">
      <span className="h-px flex-1 bg-linear-to-l from-neutral-brand-white to-transparent" />
      <span className="h-0.5 w-8 rounded-full bg-brand-color" />
      <span className="h-px flex-1 bg-linear-to-r from-neutral-brand-white to-transparent" />
    </div>
  );
}

/**
 * Every published education is a row: with a photo one wide card (the ITI diploma), else the degree card + the
 * graduation card. Each group (heading, each row, certificates) reveals once when it scrolls into view, so stacked
 * cards further down on small screens still play their entrance when they are reached.
 */
export default function Education() {
  const { data, isPending, isError } = useEducation();
  const reveal = useReveal();
  const sideBySide = useMediaQuery(MEDIA.xl);

  if (isPending) return <EducationSkeleton />;
  if (isError || !data) return null;

  const { section, educations = [], certificates = [] } = data;
  if (!educations.length && !certificates.length) return null;

  const rise = reveal({ y: REVEAL.rise });
  const fromSide = (direction) =>
    reveal(sideBySide ? { x: direction * EDUCATION_REVEAL.slide } : { y: EDUCATION_REVEAL.rise });
  const rowVariants = reveal(
    { y: EDUCATION_REVEAL.rowRise },
    { delay: EDUCATION_REVEAL.rowsDelay, stagger: EDUCATION_REVEAL.rowStagger },
  );

  return (
    <section
      id={SECTION.education}
      aria-labelledby={section?.title?.plain ? 'education-title' : undefined}
      className="overflow-clip bg-bg-primary pb-space-5"
    >
      <SectionDivider />

      <div className="flex flex-col gap-space-5 pt-space-5">
        {section && (
          <motion.header className="flex flex-col items-center gap-4 px-grid-margin text-center" {...revealOnScroll}>
            {section.badge && (
              <motion.div variants={rise} custom={ORDER.badge}>
                <Badge>{section.badge}</Badge>
              </motion.div>
            )}
            {section.title?.plain && (
              <motion.div variants={rise} custom={ORDER.title}>
                <SectionTitle id="education-title" plain={section.title.plain} highlight={section.title.highlight} />
              </motion.div>
            )}
            {section.description && (
              <motion.p variants={rise} custom={ORDER.description} className="max-w-182 text-large text-text-secondary">
                {section.description}
              </motion.p>
            )}
          </motion.header>
        )}

        <div className="mx-auto flex w-full max-w-360 flex-col gap-space-3 px-grid-margin">
          {educations.map((education) => (
            <motion.div key={education._id} className="flex flex-col gap-space-3 xl:flex-row" {...revealOnScroll}>
              {education.image ? (
                <DegreeCard education={education} className="xl:flex-1" variants={fromSide(-1)} custom={ORDER.degree} />
              ) : (
                <>
                  <DegreeCard
                    education={education}
                    className="xl:basis-2/3"
                    variants={fromSide(-1)}
                    custom={ORDER.degree}
                  />
                  <GraduationCard
                    education={education}
                    className="xl:basis-1/3"
                    variants={fromSide(1)}
                    custom={ORDER.graduation}
                  />
                </>
              )}
            </motion.div>
          ))}
          {certificates.length > 0 && (
            <CertificatesCard
              title={section?.certificatesTitle}
              certificates={certificates}
              rowVariants={rowVariants}
              variants={rise}
              {...revealOnScroll}
            />
          )}
        </div>
      </div>
    </section>
  );
}
