import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useCallback, useState } from 'react';
import Badge from '@/components/ui/Badge';
import BrandTint from '@/components/ui/BrandTint';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import { REVEAL, revealOnScroll, useReveal } from '@/lib/motion';
import { SECTION } from '@/lib/sections';
import { cn } from '@/lib/utils';
import TestimonialFormModal from './TestimonialFormModal';
import TestimonialsMarquee from './TestimonialsMarquee';
import TestimonialsSkeleton from './TestimonialsSkeleton';
import { useTestimonials } from './useTestimonials';

const TITLE_ID = 'testimonials-title';

/** Underline under the title (Figma vector), stroked in the brand color. */
function Squiggle({ className }) {
  return (
    <svg aria-hidden viewBox="0 0 218 50" fill="none" className={className}>
      <path
        d="M1 1C4.9609 1.49231 8.9218 1.98461 46.9929 3.27294C85.064 4.56127 157.125 6.63071 191.963 8.16833C226.8 9.70596 222.231 10.6491 194.119 13.1492C166.008 15.6493 114.493 19.6778 109.414 25.7131C104.336 31.7484 147.254 39.6685 168.806 43.8282C190.358 47.9878 189.243 48.1471 188.095 48.3111"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Brand-colored side glows (Figma groups exported with the section background baked in, recolored by `BrandTint`;
 * `mix-blend-lighten` hides that
 * background). Mobile: the same images at half strength, right one at the top, left one lower down.
 * `from` = the side each one slides in from.
 */
const GLOWS = [
  {
    src: '/decor/testimonials-glow-left.jpg',
    from: -REVEAL.slide,
    className: '-left-26.5 top-41 tablet:top-20.5 tablet:left-0',
  },
  {
    src: '/decor/testimonials-glow-right.jpg',
    from: REVEAL.slide,
    className: '-top-17.5 left-49.25 tablet:top-20.5 tablet:right-0 tablet:left-auto',
  },
];

/** Stagger order: badge, title, description, the cards (see `TestimonialsMarquee`), then the CTA block. */
const ORDER = { badge: 0, title: 1, description: 2, firstCard: 3, cta: 8 };

export default function Testimonials() {
  const { data, isPending, isError } = useTestimonials();
  const reveal = useReveal();
  const [formOpen, setFormOpen] = useState(false);
  const closeForm = useCallback(() => setFormOpen(false), []);

  if (isPending) return <TestimonialsSkeleton />;
  if (isError || !data?.section) return null;

  const { section, testimonials = [] } = data;
  const rise = reveal({ y: REVEAL.rise });

  return (
    <motion.section
      id={SECTION.testimonials}
      aria-labelledby={TITLE_ID}
      className="relative overflow-clip bg-neutral-surface-section py-space-5 desktop:py-space-4"
      {...revealOnScroll}
    >
      {GLOWS.map((glow) => (
        <motion.div
          key={glow.src}
          aria-hidden
          variants={reveal({ x: glow.from })}
          className={cn('pointer-events-none absolute mix-blend-lighten select-none', glow.className)}
        >
          <BrandTint src={glow.src} className="opacity-50 tablet:opacity-100" imgClassName="w-85 max-w-none" />
        </motion.div>
      ))}

      <div className="relative flex flex-col gap-space-5">
        <header className="relative mx-auto flex w-full max-w-360 flex-col items-start gap-4 px-grid-margin">
          {section.badge && (
            <motion.div variants={rise} custom={ORDER.badge}>
              <Badge>{section.badge}</Badge>
            </motion.div>
          )}
          <motion.div variants={rise} custom={ORDER.title} className="relative">
            <SectionTitle id={TITLE_ID} plain={section.title.plain} highlight={section.title.highlight} />
            <Squiggle className="pointer-events-none absolute top-full -left-2.5 hidden h-auto w-39 -translate-y-px text-brand-color select-none tablet:block desktop:w-54.5" />
          </motion.div>
          {section.description && (
            <motion.p variants={rise} custom={ORDER.description} className="max-w-182 text-large text-text-secondary tablet:mt-6">
              {section.description}
            </motion.p>
          )}
        </header>

        {testimonials.length > 0 && (
          // Unrotated wrapper for the edge fade; the padding keeps the tilted strip inside the mask.
          <div className="pointer-events-none relative -my-24 py-24">
            <div className="pointer-events-auto">
              <TestimonialsMarquee
                testimonials={testimonials}
                labelledBy={TITLE_ID}
                cardVariants={rise}
                firstIndex={ORDER.firstCard}
              />
            </div>
          </div>
        )}

        <motion.div
          variants={rise}
          custom={ORDER.cta}
          className="relative flex flex-col items-center gap-6 px-grid-margin text-center"
        >
          <div className="flex max-w-182 flex-col gap-2">
            {section.ctaHeading && <h3 className="text-h6 font-bold text-neutral">{section.ctaHeading}</h3>}
            {section.ctaDescription && <p className="text-large text-neutral">{section.ctaDescription}</p>}
          </div>
          <Button
            variant="primary"
            icon={<ArrowUpRight className="size-6" />}
            rotateIcon
            aria-haspopup="dialog"
            onClick={() => setFormOpen(true)}
          >
            {section.ctaButtonLabel}
          </Button>
        </motion.div>
      </div>

      <TestimonialFormModal open={formOpen} onClose={closeForm} />
    </motion.section>
  );
}
