import { cn } from '@/lib/utils';

/**
 * Section heading: `plain` in white followed by `highlight` in brand green (e.g. "Tools & Methods.").
 * `stacked` puts the highlight on its own line (Contact: "Let's Build / Something.").
 */
export default function SectionTitle({ plain, highlight, stacked = false, as: Tag = 'h2', className, ...props }) {
  return (
    <Tag className={cn('text-h2 font-bold text-text-primary', className)} {...props}>
      {plain}
      {highlight && (
        <span className={cn('text-text-brand', stacked && 'block')}>
          {stacked ? highlight : ` ${highlight}`}
        </span>
      )}
    </Tag>
  );
}
