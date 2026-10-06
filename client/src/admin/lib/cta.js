import { z } from 'zod';
import { IDENTITY_CTA_ACTIONS, IDENTITY_LIMITS } from '@shared/identity';
import { isUrlLike, tooLong } from './contentItems';

/** Copy of a button editor (`CtaEditor`), shared by Identity (hero buttons) and Contact. */
export const CTA_COPY = {
  ctaLabel: { label: 'Label', placeholder: 'View my work', optional: 'Optional' },
  action: 'Action',
  actions: {
    scroll: 'Scroll to section',
    link: 'Open URL',
    email: 'Send email',
    whatsapp: 'WhatsApp',
    cv: 'Download CV',
  },
  section: { label: 'Target', placeholder: 'Choose a section' },
  hiddenSection: (label) => `${label} (hidden)`,
  hiddenWarning: 'This section is hidden on the site, so the button has nowhere to scroll.',
  url: { label: 'URL', placeholder: 'https://dribbble.com/you' },
  emailInfo: (email) => `Opens Gmail with a new message to ${email}.`,
  emailMissing: 'Add a contact email on the Contact page, or this button stays hidden on the site.',
  whatsappInfo: (number) => `Opens a WhatsApp chat with ${number}.`,
  whatsappMissing: 'Add a WhatsApp number on the Contact page, or this button stays hidden on the site.',
  cvInfo: 'Opens the resume uploaded in Identity.',
  cvMissing: 'Upload a resume in Identity, or this button stays hidden on the site.',
};

export const CTA_LABEL_MAX = IDENTITY_LIMITS.ctaLabel;

export const emptyCta = () => ({ label: '', action: 'scroll', target: '' });

/** `{ label, action, target }`; a `link` target must look like a URL. `required` also needs a label and target. */
export const ctaSchema = ({ required = false, urlMessage = 'Enter a valid URL, e.g. https://example.com' } = {}) =>
  z
    .object({ label: z.string().max(CTA_LABEL_MAX, tooLong(CTA_LABEL_MAX)), action: z.enum(IDENTITY_CTA_ACTIONS), target: z.string() })
    .superRefine((value, context) => {
      if (value.action === 'link' && value.target.trim() && !isUrlLike(value.target)) {
        context.addIssue({ code: 'custom', path: ['target'], message: urlMessage });
      }
      if (!required) return;
      if (!value.label.trim()) context.addIssue({ code: 'custom', path: ['label'], message: 'Label is required' });
      if ((value.action === 'scroll' || value.action === 'link') && !value.target.trim()) {
        context.addIssue({ code: 'custom', path: ['target'], message: 'Choose where the button goes' });
      }
    });
