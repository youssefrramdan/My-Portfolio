import ContactSection from '../../src/modules/contact/contactSection.model.js';

/** Copy taken exactly from the Figma "Get in Touch" frame (616:14038). */
const SECTION = {
  badge: 'Get in Touch',
  title: { plain: "Let's Build", highlight: 'Something.' },
  description: "Have a project in mind? Looking for an engineer who builds secure, scalable, and reliable backends? Let's talk.",
  // "Linkedin" is spelled as in Figma.
  primaryCta: { label: 'View Linkedin', action: 'link', target: 'https://linkedin.com/in/youssefrramdan' }, // TODO: placeholder URL
  secondaryCta: { label: 'Send Email', action: 'email', target: '' },
};

export default async function seedContact() {
  await ContactSection.findOneAndReplace({}, SECTION, { upsert: true, runValidators: true });
  return ContactSection.countDocuments();
}
