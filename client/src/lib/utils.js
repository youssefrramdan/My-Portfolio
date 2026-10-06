import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the custom Figma text sizes so `text-h1` and `text-text-primary`
// are treated as different groups (size vs color) and are not merged away.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'extra-large', 'large', 'base', 'small', 'extra-small', 'display'],
      leading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'xl', 'l', 'b', 's', 'xs'],
      'font-weight': ['regular', 'medium', 'semi-bold', 'bold', 'black'],
      radius: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'],
      spacing: ['space-1', 'space-2', 'space-3', 'space-4', 'space-5', 'grid-margin', 'grid-gutter'],
      breakpoint: ['tablet', 'desktop'],
      blur: ['glass'],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
