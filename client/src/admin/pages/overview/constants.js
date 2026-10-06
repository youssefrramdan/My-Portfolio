import { Eye, Plus, UserRound } from 'lucide-react';
import { WORK_PATH as WORK } from '../../lib/contentLibrary';

/** Overview page chrome (Figma 538:7349). */
export const OVERVIEW = {
  eyebrow: 'Portfolio workspace',
  welcome: (name) => (name ? `Welcome back, ${name}.` : 'Welcome back.'),
  subtitle: 'Here’s what’s happening with your portfolio today.',

  health: {
    badge: 'Portfolio health',
    ready: { plain: 'Your portfolio is', highlight: 'ready to shine.' },
    almost: { plain: 'Your portfolio is', highlight: 'almost ready to shine.' },
    readyText: 'Everything is in place. Preview the experience one more time, then share it with the world.',
    almostText: 'Your identity and work are in place. Finish the last details, preview the experience, then share it with the world.',
    publish: 'Publish portfolio',
    preview: 'Open preview',
  },

  setup: {
    eyebrow: 'Setup progress',
    progressLabel: (done, total) => `${done} of ${total} setup steps done`,
    doneLabel: 'Done',
    todoLabel: 'Not done yet',
  },

  library: {
    eyebrow: 'Content library',
    title: 'Your content',
    add: 'Add content',
    addTo: WORK,
  },

  stack: {
    eyebrow: 'Homepage',
    title: 'Section stack',
    edit: 'Edit page',
    editTo: '/admin/page',
    empty: 'Visible but empty, hidden automatically on the live site',
    toggle: (label) => `Show ${label} on the home page`,
    reorder: (label) => `Reorder ${label}`,
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Could not save the section stack. Your last change was undone.',
    footer: { label: 'Footer', source: 'Fixed site chrome · Uses Identity and Settings', badge: 'Always on' },
    instructions:
      'To reorder a section, press Space or Enter on its handle, move it with the up and down arrow keys, then press Space or Enter to drop it or Escape to cancel.',
    announce: {
      start: (label, position, total) => `Picked up ${label}, position ${position} of ${total}.`,
      over: (label, position, total) => `${label} moved to position ${position} of ${total}.`,
      end: (label, position, total) => `${label} dropped at position ${position} of ${total}.`,
      cancel: (label) => `Reordering ${label} was cancelled.`,
    },
  },

  recent: {
    eyebrow: 'Recent work',
    title: 'Continue where you left off',
    add: 'Add new work',
    addTo: WORK,
    editTo: (id) => `${WORK}/${id}`,
    hidden: 'Draft',
    untitled: 'Untitled work',
    emptyTitle: 'No work yet',
    emptyText: 'Add your first project and it will show up here, ready to polish.',
    editLabel: (title) => `Edit ${title}`,
  },

  quick: {
    eyebrow: 'Quick actions',
  },

  error: {
    title: 'Could not load the overview',
    message: 'Something went wrong while loading your dashboard data.',
    retry: 'Try again',
  },
};

/** Quick action tiles. `preview: true` opens the public site in a new tab. */
export const QUICK_ACTIONS = [
  { key: 'add-work', title: 'Add work', subtitle: 'Create a new draft project', icon: Plus, to: WORK },
  { key: 'identity', title: 'Edit identity', subtitle: 'Update your profile and portrait', icon: UserRound, to: '/admin/identity' },
  { key: 'preview', title: 'Open preview', subtitle: 'Review the complete draft site', icon: Eye, preview: true },
];
