import { COMING_SOON_LIMITS, OG_IMAGE_SIZE, PASSWORD_LIMITS, SEO_LIMITS } from '@shared/settings';
import { imageFieldCopy } from '../../components/content/ImageField';

const SAVE = {
  saved: 'All changes saved',
  saving: 'Saving…',
  invalid: 'Fix the highlighted fields to save',
  error: 'Could not save',
  retry: 'Retry',
  leaveWarning: 'Your latest changes are not saved yet.',
};

/** Settings pages (Figma 546:16718 General, 546:17464 SEO). Coming soon and Account follow the same layout. */
export const SETTINGS = {
  eyebrow: 'Portfolio workspace',
  bar: {
    title: 'Site settings',
    text: 'Global configuration shared by navigation, contact, publishing, and search previews.',
    account: 'Changes here need your current password and are saved with their own button.',
  },
  tabsLabel: 'Settings sections',
  optional: 'Optional',
  tabs: { general: 'General', seo: 'SEO', comingSoon: 'Coming soon', account: 'Account' },
  save: SAVE,
  loadError: { title: 'Could not load the settings', message: 'Something went wrong while loading them.', retry: 'Try again' },
};

export const GENERAL = {
  title: 'General',
  subtitle: 'Manage your site address, brand color, profile, contact email and footer.',
  site: {
    title: 'General settings',
    description: 'Name the site and manage the address used for your portfolio.',
    name: { label: 'Site name', placeholder: 'Youssef Ramadan - Backend Software Engineer', hint: 'Used in browser titles and sharing previews.', required: 'Site name is required' },
    url: {
      label: 'Site URL',
      placeholder: 'https://yourname.com',
      hint: 'The public address: used for canonical links, the sitemap and link previews.',
      required: 'Site URL is required',
      invalid: 'Enter a valid address, e.g. https://yourname.com',
    },
  },
  brand: {
    title: 'Brand color',
    description: 'The main color of the whole site and this dashboard: buttons, highlights and active states.',
    label: 'Brand color',
    pick: 'Pick the brand color',
    reset: 'Reset to default',
    preview: 'Preview',
    button: 'Button',
    highlight: 'Highlighted',
    text: 'words',
    invalid: 'Pick a color',
    hint: 'Text on brand buttons switches between dark and white so it stays readable.',
  },
  profile: {
    title: 'Profile',
    description: 'Your photo, name and title on the dashboard user card.',
    photo: { ...imageFieldCopy({ label: 'Profile photo', altPlaceholder: 'Youssef smiling' }), hint: 'Square photo works best' },
    name: { label: 'Name', placeholder: 'Youssef', required: 'Name is required' },
    role: { label: 'Title', placeholder: 'Backend Software Engineer' },
  },
  email: {
    title: 'Contact email',
    description: 'Required for portfolio setup and the “Send email” buttons. Same address as the Contact page.',
    label: 'Email',
    placeholder: 'hello@yourname.com',
    required: 'Contact email is required',
    invalid: 'Enter a valid email address, e.g. hello@yourname.com',
  },
  footer: {
    title: 'Footer',
    description: 'The small print at the bottom of the home page.',
    copyright: { label: 'Copyright', placeholder: '© 2026 Your Name' },
    backToTop: { label: 'Back to top label', placeholder: 'Back Up', required: 'Back to top label is required' },
  },
  address: {
    eyebrow: 'Public address',
    empty: 'No address yet',
    copy: 'Copy URL',
    copied: 'Copied',
    failed: 'Could not copy',
    open: 'Open site',
  },
  hint: { title: 'Saved straight to the site', text: 'There is no draft here: every change goes live once it is saved.' },
};

export const SEO = {
  title: 'SEO',
  subtitle: 'How your portfolio looks in Google results and when a link is shared.',
  sharing: {
    title: 'Search & sharing',
    description: 'Default metadata used by search engines and social previews.',
    seoTitle: { label: 'SEO title', placeholder: 'Youssef Ramadan - Backend Software Engineer', required: 'SEO title is required', hint: 'Keep it between 30 and 60 characters.' },
    seoDescription: {
      label: 'SEO description',
      placeholder: 'Product designer creating intuitive digital experiences…',
      required: 'SEO description is required',
      hint: 'Aim for 70 to 160 characters.',
    },
    image: {
      ...imageFieldCopy({ label: 'OG image', altPlaceholder: 'Portfolio cover with name and role' }),
      optional: `Recommended · ${OG_IMAGE_SIZE.width} × ${OG_IMAGE_SIZE.height}`,
      hint: `Wide image, ${OG_IMAGE_SIZE.width} × ${OG_IMAGE_SIZE.height}. Empty = the hero photo.`,
    },
  },
  engines: {
    title: 'Search engines',
    description: 'Prove the site is yours to Google and set the browser tab icon.',
    verification: {
      label: 'Google Search Console code',
      placeholder: 'Paste the HTML tag or its content value',
      hint: 'Search Console > Add property > URL prefix > HTML tag. The whole tag can be pasted.',
      invalid: 'Paste the code from Google Search Console (letters, numbers, - and _)',
      open: 'Open Search Console',
    },
    favicon: { ...imageFieldCopy({ label: 'Favicon', altPlaceholder: 'Site icon' }), hint: 'Square PNG, at least 180 × 180. Empty = the round logo icon.' },
  },
  files: {
    title: 'Sitemap & robots',
    description: 'Generated from your published pages. Submit the sitemap in Search Console.',
    sitemap: 'Sitemap',
    robots: 'Robots',
    copy: (name) => `Copy ${name} URL`,
    copied: 'Copied',
  },
  preview: {
    search: 'Search preview',
    social: 'Social preview',
    noImage: 'No sharing image yet',
  },
  checklist: {
    title: 'SEO checklist',
    done: (done, total) => `${done} of ${total} done`,
    doneLabel: '(done)',
    todoLabel: '(to do)',
    items: {
      title: 'Title between 30 and 60 characters',
      description: 'Description between 70 and 160 characters',
      image: 'Sharing image chosen',
      url: 'Site URL set in General',
      verification: 'Google Search Console verified',
      published: 'Site published (indexing is off while it is not)',
    },
  },
  limits: SEO_LIMITS,
};

export const COMING_SOON = {
  title: 'Coming soon',
  subtitle: 'The page visitors see while the site is unpublished.',
  content: {
    title: 'Coming soon page',
    description: 'Shown to everyone but you until you press Publish.',
    badge: { label: 'Badge', placeholder: 'Coming Soon' },
    plain: { label: 'Title', placeholder: 'Something good is', required: 'Title is required' },
    highlight: { label: 'Highlighted words', placeholder: 'being built.', hint: 'Shown in green after the title.' },
    message: { label: 'Message', placeholder: 'The portfolio is being updated. Check back very soon.' },
    smallPrint: { label: 'Small print', placeholder: 'Secure, scalable backends, built with care.' },
    image: imageFieldCopy({ label: 'Image', altPlaceholder: 'Portfolio artwork' }),
    showEmail: { label: 'Show the “Send Email” button', text: 'Opens a message to the contact email.' },
  },
  status: {
    title: 'Site status',
    live: 'Your site is published, so visitors see the full portfolio.',
    hidden: 'Your site is unpublished, so visitors see this page.',
    preview: 'Preview coming soon page',
  },
  hint: { title: 'Saved straight to the site', text: 'Changes show on the Coming soon page as soon as they are saved.' },
  limits: COMING_SOON_LIMITS,
};

export const ACCOUNT = {
  title: 'Account',
  subtitle: 'The email and password you use to sign in to this dashboard.',
  email: {
    title: 'Login email',
    description: 'Only used to sign in. Visitors never see it.',
    current: 'Current login email',
    label: 'New login email',
    placeholder: 'you@example.com',
    required: 'Email is required',
    invalid: 'Enter a valid email address',
    same: 'This is already your login email',
    submit: 'Update email',
    saving: 'Updating…',
    success: 'Login email updated.',
  },
  password: {
    title: 'Password',
    description: `At least ${PASSWORD_LIMITS.min} characters. Other devices are signed out after a change.`,
    newLabel: 'New password',
    confirmLabel: 'Confirm new password',
    required: 'Enter a new password',
    min: `Use at least ${PASSWORD_LIMITS.min} characters`,
    max: `Use at most ${PASSWORD_LIMITS.max} characters`,
    mismatch: 'The passwords do not match',
    same: 'The new password must be different from the current one',
    submit: 'Update password',
    saving: 'Updating…',
    success: 'Password updated. Other devices were signed out.',
  },
  currentPassword: { label: 'Current password', required: 'Enter your current password' },
  show: 'Show password',
  hide: 'Hide password',
  error: 'Could not save. Try again.',
  hint: { title: 'Keep it private', text: 'After 5 wrong current passwords, changes are paused for 15 minutes.' },
};
