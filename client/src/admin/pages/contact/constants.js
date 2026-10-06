import { MAX_SOCIALS, MIN_SOCIALS } from '@shared/contact';
import { CTA_COPY } from '../../lib/cta';
import { mainDetailsCopy } from '../../lib/contentItems';
import { REORDER_LABELS } from '../../lib/reorder';

/** Contact page (Figma 544:11559). Everything here goes live as soon as it is saved. */
export const CONTACT = {
  eyebrow: 'Content library',
  title: 'Contact',
  subtitle: 'How visitors reach you: the contact email, your social channels and the two buttons under the Contact section.',
  loadError: { title: 'Could not load the contact settings', message: 'Something went wrong while loading them.', retry: 'Try again' },
  save: {
    saved: 'All changes saved',
    saving: 'Saving…',
    invalid: 'Fix the highlighted fields to save',
    error: 'Could not save',
    retry: 'Retry',
    leaveWarning: 'Your latest changes are not saved yet.',
  },
  email: {
    eyebrow: 'Contact details',
    label: 'Email',
    placeholder: 'hello@yourname.com',
    hint: 'The “Send email” buttons open a message to this address.',
    required: 'Contact email is required',
    invalid: 'Enter a valid email address, e.g. hello@yourname.com',
  },
  whatsapp: {
    label: 'WhatsApp number',
    optional: 'Optional',
    placeholder: '+20 100 123 4567',
    hint: 'The “WhatsApp” buttons open a chat with this number. Include the country code.',
    invalid: 'Use the international format with the country code, e.g. +20 100 123 4567',
  },
  socials: {
    eyebrow: 'Social channels',
    text: `Shown as icons around the Contact section, in this order. Up to ${MAX_SOCIALS}, one per platform.`,
    add: 'Add channel',
    full: `You can add up to ${MAX_SOCIALS} channels.`,
    empty: 'No channels yet. Add the places visitors can find you.',
    platform: (position) => `Platform of channel ${position}`,
    url: (platform) => `${platform} link`,
    urlPlaceholder: 'https://',
    urlRequired: 'Add the link',
    urlInvalid: 'Enter a valid URL, e.g. https://linkedin.com/in/you',
    duplicate: 'Each platform can be added once',
    remove: (platform) => `Remove ${platform}`,
    move: (platform) => `Reorder ${platform}`,
    count: (count) => `${count} / ${MAX_SOCIALS}`,
    ...REORDER_LABELS,
  },
  ctas: {
    eyebrow: 'Buttons',
    text: 'The two buttons under the Contact heading. Leave the secondary label empty to hide it.',
    primary: 'Primary button',
    secondary: 'Secondary button',
    ...CTA_COPY,
    ctaLabel: { ...CTA_COPY.ctaLabel, placeholder: 'Start a Project' },
    targetRequired: 'Choose where the button goes',
  },
  checklist: {
    eyebrow: 'Setup checklist',
    done: (done, total) => `${done} of ${total} done`,
    items: {
      email: 'Contact email added',
      socials: `At least ${MIN_SOCIALS} social channels`,
      primary: 'Primary button ready',
    },
  },
  hint: {
    title: 'Saved straight to the site',
    text: 'There is no draft here: every change goes live once it is saved. The Overview checklist follows these items.',
  },
};

export const SECTION_FORM = mainDetailsCopy({
  description: 'The heading of the Contact section on the home page. Saved straight to the site.',
  badge: 'Get in touch',
  title: "Let's Work Together.",
  subtitle: 'Have a project in mind? Let’s build something people love to use.',
});
