import { CAPABILITY_LIMITS, CAPABILITY_SOFT_ITEMS, MAX_PUBLISHED_GROUPS } from '@shared/capabilities';
import { imageFieldCopy } from '../../components/content/ImageField';
import { CAPABILITIES_PATH } from '../../lib/contentLibrary';
import { editorCopy, listCopy, mainDetailsCopy } from '../../lib/contentItems';
import { ICON_PICKER_COPY } from '../../lib/iconPicker';
import { REORDER_LABELS } from '../../lib/reorder';

export { CAPABILITIES_PATH };
export const capabilityEditPath = (id) => `${CAPABILITIES_PATH}/${id}`;

/** Capabilities list page (Figma 538:9668). */
export const CAPABILITIES_LIST = {
  ...listCopy({ noun: 'group', plural: 'groups' }),
  title: 'Capabilities',
  subtitle: 'Group tools, methods, services, skills, or gear. These items can also power Work tags and Hero references.',
  add: 'New group',
  library: 'All groups',
  untitled: 'Untitled group',
  noItems: 'No items yet',
  items: (count) => `${count} ${count === 1 ? 'item' : 'items'}`,
  live: (count) => `${count}/${MAX_PUBLISHED_GROUPS} live`,
  liveHint: `The section shows up to ${MAX_PUBLISHED_GROUPS} published groups.`,
  empty: { title: 'No groups yet', text: 'Add your first group of tools or skills. It stays a draft until you publish it.' },
};

export const SECTION_FORM = mainDetailsCopy({
  description: 'The heading above your capability cards on the home page. Saved straight to the site.',
  badge: 'My Stack',
  title: 'Tools & Methods.',
  subtitle: 'Support the section title with a short description...',
});

/** Capability group editor (Figma 538:9991). */
export const CAPABILITY_EDITOR = {
  ...editorCopy({
    noun: 'group',
    back: 'Back to Capabilities',
    deleteLabel: 'Delete Collection',
    deleteText: (title) => `“${title}” is removed from the library and the site. This cannot be undone.`,
    fields: { title: 'Group name', glyph: 'Icon', icon: 'Icon image', items: 'Items' },
    hintTitle: 'New group',
  }),
  group: {
    eyebrow: 'Capability group',
    title: { label: 'Group name', placeholder: 'Design Tools' },
    glyph: {
      label: 'Icon',
      optional: 'Optional',
      hint: 'Pick from thousands of icons. It takes the brand color on the card.',
      none: 'No icon picked',
      remove: 'Remove icon',
      imageNote: 'An icon is picked, so the image below is not shown on the card.',
      picker: ICON_PICKER_COPY,
    },
    icon: imageFieldCopy({
      label: 'Or use your own image',
      altPlaceholder: 'Design tools icon',
      hint: 'SVG or PNG · shown when no icon is picked',
    }),
    items: {
      label: 'Items',
      hint: 'Drag to set the order used by chips and hero references.',
      add: 'Add item',
      placeholder: 'Figma',
      itemLabel: (position) => `Item ${position}`,
      move: (position) => `Reorder item ${position}`,
      remove: (position) => `Remove item ${position}`,
      empty: 'No items yet. Add the tools, methods or skills of this group.',
      count: (count) => `${count}/${CAPABILITY_LIMITS.items}`,
      full: `A group can hold up to ${CAPABILITY_LIMITS.items} items.`,
      ...REORDER_LABELS,
    },
    softLimit: `Soft limit: keep groups under ${CAPABILITY_SOFT_ITEMS} items to avoid clamping on the live site.`,
  },
  limitNote: `Only ${MAX_PUBLISHED_GROUPS} groups can be live at once (one per card on the home page).`,
};
