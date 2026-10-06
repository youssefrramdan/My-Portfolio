import { galleryRows } from '@shared/work';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { PROJECT_TEXT } from './labels';

const WIDTHS = [480, 800, 1200, 1800, 2400];
/** Rendered widths: the 1177px column from xl, else the screen minus its margins (half for paired images). */
const SIZES = { full: '(min-width: 80rem) 1177px, 100vw', half: '(min-width: 80rem) 589px, 50vw' };
const srcSet = (url) => WIDTHS.map((width) => `${cldUrl(url, { width })} ${width}w`).join(', ');

/**
 * Project gallery (Figma 549:18363): images stacked edge to edge, no gaps. Two consecutive half-width images share
 * a row; a lone half-width image fills its row. `compact` renders small thumbnails (dashboard preview).
 */
export default function ProjectGallery({ gallery = [], title = '', compact = false, className }) {
  const rows = galleryRows(gallery);
  if (!rows.length) return null;
  let position = 0;

  return (
    <div className={cn('flex flex-col', className)}>
      {rows.map((row) => {
        const paired = row.length === 2;
        return (
          <div key={`${position}-${row[0].url}`} className={cn('grid', paired && 'grid-cols-2')}>
            {row.map((image) => {
              position += 1;
              const eager = position === 1 && !compact;
              return (
                <img
                  key={`${position}-${image.url}`}
                  src={cldUrl(image.url, { width: compact ? 480 : 1200 })}
                  srcSet={compact ? undefined : srcSet(image.url)}
                  sizes={compact ? undefined : SIZES[paired ? 'half' : 'full']}
                  alt={image.alt || PROJECT_TEXT.imageAlt(title, position)}
                  loading={eager ? 'eager' : 'lazy'}
                  fetchPriority={eager ? 'high' : undefined}
                  decoding="async"
                  draggable={false}
                  className={cn('block h-auto w-full bg-neutral-surface-2', paired && 'h-full object-cover')}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
