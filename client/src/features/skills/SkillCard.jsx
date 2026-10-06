import { motion, useReducedMotion } from 'framer-motion';
import Chip from '@/components/ui/Chip';
import Icon from '@/components/ui/Icon';
import { CARD_HOVER } from '@/lib/motion';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

const hoverLift = { y: CARD_HOVER.lift };
const hoverTransition = { duration: CARD_HOVER.duration, ease: CARD_HOVER.ease };

/**
 * One category card: icon tile + title, then its chips (Figma "Design Tools Container").
 * The outer element takes the slot styles and the reveal props (`variants`, `custom`); the hover lift lives on
 * the inner card so ending a hover never replays the reveal's stagger delay.
 */
export default function SkillCard({ category, className, ...props }) {
  const reduce = useReducedMotion();
  const items = category.items ?? [];

  return (
    <motion.div {...props} className={cn('tablet:shrink-0', className)}>
      <motion.article
        whileHover={reduce ? undefined : hoverLift}
        transition={hoverTransition}
        className={cn(
          // Inset ring = Figma "inside" stroke: drawn over the card without shrinking the content box.
          'flex flex-col gap-space-4 overflow-hidden rounded-card bg-neutral-surface-0 px-space-3 py-space-4 ring-2 ring-border-primary ring-inset',
          'transition-shadow duration-300 ease-out hover:ring-brand-color',
          'tablet:min-h-71 tablet:w-72.25 tablet:gap-space-3 tablet:px-space-4 tablet:py-space-3',
        )}
      >
        <header className="flex items-center gap-4">
          <span className="flex size-15 shrink-0 items-center justify-center rounded-tile bg-brand-color/5">
            {category.glyph?.nodes?.length ? (
              <Icon nodes={category.glyph.nodes} className="size-8 text-text-brand" />
            ) : (
              category.icon?.url && <img src={cldUrl(category.icon.url)} alt="" width={32} height={32} className="size-8" />
            )}
          </span>
          <h3 className="text-large text-text-primary">{category.title}</h3>
        </header>

        {items.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <li key={`${item}-${index}`} className="flex">
                <Chip>{item}</Chip>
              </li>
            ))}
          </ul>
        )}
      </motion.article>
    </motion.div>
  );
}
