/** Fixed UI text of the testimonial form (documented exception to "no hardcoded text"). */
export const TESTIMONIAL_FORM = {
  eyebrow: 'New comment',
  title: 'Leave Your Testimonial',
  close: 'Close',
  fields: {
    name: { label: 'Your Name', placeholder: 'e.g. Ahmed Yasser', errorName: 'Name' },
    role: { label: 'Your job title', placeholder: 'e.g. CEO · Orbit Analytics', errorName: 'Job title' },
    message: { label: 'Leave a comment', placeholder: 'Leave a comment...', errorName: 'Comment' },
  },
  honeypot: 'Leave this field empty',
  cancel: 'Cancel',
  send: 'Send',
  sending: 'Sending...',
  success: 'Thank you! Your testimonial was sent and will appear on the site after review.',
};

export const TESTIMONIAL_ERRORS = {
  required: (name) => `${name} is required`,
  tooLong: (name, max) => `${name} must be ${max} characters or less`,
  invalid: 'Please fix the highlighted fields and try again.',
  rateLimited: 'Too many submissions. Please wait a few minutes and try again.',
  network: "Couldn't reach the server. Check your connection and try again.",
  generic: 'Something went wrong. Please try again.',
};
