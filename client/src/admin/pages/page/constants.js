import { OVERVIEW } from '../overview/constants';

/** Page screen (Figma 546:16219). */
export const PAGE = {
  eyebrow: 'Portfolio workspace',
  title: 'Page',
  subtitle: 'Choose what appears, in what order, and under which navbar label.',
  hero: {
    badge: 'How my site looks',
    plain: 'Shape the page,',
    highlight: 'not the template.',
    text: 'Reorder typed sections, control visibility, rename navbar labels, and preview the live homepage before you share it.',
  },
  stack: {
    ...OVERVIEW.stack,
    title: 'Section stack',
    count: (count) => `${count} sections`,
    usesContent: (source) => `Uses content from ${source}`,
    moveUp: (label) => `Move ${label} up`,
    moveDown: (label) => `Move ${label} down`,
    navLabel: 'Navbar label',
    hiddenNav: 'Hidden, so not in the navbar',
    empty: 'Visible but empty — hidden automatically on the live site.',
  },
  health: {
    eyebrow: 'Live page health',
    visible: 'Visible sections',
    warnings: 'Warnings',
    preview: 'Preview homepage',
  },
  validation: {
    title: 'Publish validation',
    ok: 'Every visible section has content and every button has a target.',
    text: 'Fix empty visible sections and missing CTA targets.',
    edit: (source) => `Open ${source}`,
  },
  error: {
    title: 'Could not load the page layout',
    message: 'Something went wrong while loading the sections.',
    retry: 'Try again',
  },
};
