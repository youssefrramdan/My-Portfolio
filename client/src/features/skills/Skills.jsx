import { motion } from 'framer-motion';
import BrandTint from '@/components/ui/BrandTint';
import Badge from '@/components/ui/Badge';
import SectionTitle from '@/components/ui/SectionTitle';
import { REVEAL, revealOnScroll, useReveal } from '@/lib/motion';
import { SECTION } from '@/lib/sections';
import { cn } from '@/lib/utils';
import SkillCard from './SkillCard';
import SkillsSkeleton from './SkillsSkeleton';
import { CARD_SLOTS } from './slots';
import { useSkills } from './useSkills';

/**
 * Light triangles on both sides (exported from Figma as images with the section background baked in;
 * `mix-blend-lighten` hides that background). Mobile: right one at the top, left one at the bottom.
 * `from` = the side each one slides in from.
 */
const LIGHTS = [
  {
    src: '/decor/skills-light-left.jpg',
    from: -REVEAL.slide,
    className:
      '-bottom-55 -left-12.5 w-85 tablet:top-0 tablet:bottom-auto tablet:left-0 tablet:h-full tablet:w-auto',
  },
  {
    src: '/decor/skills-light-right.jpg',
    from: REVEAL.slide,
    className:
      '-top-4.5 left-14 w-85 tablet:top-0 tablet:right-0 tablet:left-auto tablet:h-full tablet:w-auto',
  },
];

/** Stagger order: badge, title, description, then the cards in slot order. */
const ORDER = { badge: 0, title: 1, description: 2, firstCard: 3 };

export default function Skills() {
  const { data, isPending, isError } = useSkills();
  const reveal = useReveal();

  if (isPending) return <SkillsSkeleton />;
  const categories = data?.categories ?? [];
  if (isError || !categories.length) return null;

  const { section } = data;
  const rise = reveal({ y: REVEAL.rise });

  return (
    <motion.section
      id={SECTION.skills}
      aria-labelledby={section?.title ? 'skills-title' : undefined}
      className="relative overflow-clip bg-neutral-surface-section py-space-5 desktop:pt-space-4 xl:pb-13"
      {...revealOnScroll}
    >
      {LIGHTS.map((light) => (
        <motion.div
          key={light.src}
          aria-hidden
          variants={reveal({ x: light.from })}
          className={cn('pointer-events-none absolute mix-blend-lighten', light.className)}
        >
          <BrandTint src={light.src} className="h-full" imgClassName="h-auto w-full max-w-none tablet:h-full tablet:w-auto" />
        </motion.div>
      ))}

      <div className="relative flex flex-col gap-space-5">
        {section && (
          <header className="flex flex-col items-center gap-4 px-grid-margin text-center tablet:items-start tablet:text-left">
            {section.badge && (
              <motion.div variants={rise} custom={ORDER.badge}>
                <Badge>{section.badge}</Badge>
              </motion.div>
            )}
            {section.title?.plain && (
              <motion.div variants={rise} custom={ORDER.title}>
                <SectionTitle id="skills-title" plain={section.title.plain} highlight={section.title.highlight} />
              </motion.div>
            )}
            {section.description && (
              <motion.p variants={rise} custom={ORDER.description} className="max-w-182 text-large text-text-secondary">
                {section.description}
              </motion.p>
            )}
          </header>
        )}

        <div className="flex flex-col gap-4 px-grid-margin tablet:flex-row tablet:flex-wrap tablet:justify-center tablet:gap-x-space-4 tablet:gap-y-space-5 xl:flex-nowrap xl:items-start xl:gap-5.5 xl:px-0">
          {categories.slice(0, CARD_SLOTS.length).map((category, index) => (
            <SkillCard
              key={category._id}
              category={category}
              className={CARD_SLOTS[index]}
              variants={rise}
              custom={ORDER.firstCard + index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
