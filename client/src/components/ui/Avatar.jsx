import { cn } from '@/lib/utils';

const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

/** First user-visible character (grapheme), so emoji, accents and Arabic letters stay whole. */
const initialOf = (name = '') => {
  const text = name.trim();
  if (!text) return '';
  const first = segmenter ? segmenter.segment(text)[Symbol.iterator]().next().value.segment : Array.from(text)[0];
  return first.toLocaleUpperCase();
};

/** Green initial on a faint green circle (Figma testimonial avatar). Decorative: the name is shown next to it. */
export default function Avatar({ name, className }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-17.5 shrink-0 items-center justify-center rounded-full bg-brand-color/5 text-h4 font-bold text-text-brand',
        className,
      )}
    >
      {initialOf(name)}
    </span>
  );
}
