import { motion } from 'framer-motion';
import Chip from '@/components/ui/Chip';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { CARD_CLASS } from './card';

/**
 * Glow in the top-right corner: a white blurred circle exported from Figma as SVG (blur baked in), and the brand
 * one drawn in CSS so it follows the brand color (Figma: r 84, blur 53.75, 29% fill, same offset).
 */
const GLOWS = [{ src: '/decor/education-glow-white.svg', className: '-top-48.5 -right-33.5' }];
const BRAND_GLOW = 'top-[-8.5px] right-[35.5px] size-42 rounded-full bg-brand-color/29 blur-[53.75px]';

const PHOTO_WIDTHS = [480, 720, 960];

/**
 * One education (Figma "Component 10"): pill, title, institution and subject chips. With a photo (the ITI diploma
 * card, 631:16826) it spans the row and the photo sits on its right from desktop, below the text before that.
 */
export default function DegreeCard({ education, className, ...motionProps }) {
  const { label, degreeTitle, institution, subjects = [], image } = education;

  return (
    <motion.article
      className={cn(CARD_CLASS, 'flex flex-col gap-space-3 xl:flex-row xl:items-stretch xl:justify-between', className)}
      {...motionProps}
    >
      {GLOWS.map((glow) => (
        <img
          key={glow.src}
          src={glow.src}
          alt=""
          aria-hidden
          className={cn('pointer-events-none absolute max-w-none select-none', glow.className)}
        />
      ))}
      <span aria-hidden className={cn('pointer-events-none absolute', BRAND_GLOW)} />

      <div className="relative flex min-w-0 flex-col items-start gap-space-3 xl:justify-between">
        <p className="rounded-full border border-brand-color bg-brand-color/10 px-5 py-2 text-large text-icon-hover">{label}</p>
        <h3 className="text-h2 font-bold text-text-primary">{degreeTitle}</h3>
        <p className="max-w-152.5 text-large text-text-secondary">{institution}</p>
        {subjects.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <li key={subject.label}>
                <Chip>{subject.label}</Chip>
              </li>
            ))}
          </ul>
        )}
      </div>

      {image?.url && (
        <img
          src={cldUrl(image.url, { width: 720 })}
          srcSet={PHOTO_WIDTHS.map((width) => `${cldUrl(image.url, { width })} ${width}w`).join(', ')}
          sizes="(min-width: 80rem) 323px, 100vw"
          alt={image.alt ?? ''}
          width={323}
          height={303}
          loading="lazy"
          decoding="async"
          className="relative aspect-323/303 w-full rounded-card object-cover tablet:max-w-80.75 xl:shrink-0 xl:self-center"
        />
      )}
    </motion.article>
  );
}
