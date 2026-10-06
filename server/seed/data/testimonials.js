import Testimonial from '../../src/modules/testimonials/testimonial.model.js';
import TestimonialsSection from '../../src/modules/testimonials/testimonialsSection.model.js';

/** Copy taken exactly from the Figma "Kind Words" section (node 616:13982). */
const SECTION = {
  badge: 'Kind Words',
  title: { plain: 'What People', highlight: 'Say.' },
  ctaHeading: 'Worked with me before?',
  ctaDescription: "Share your experience and help others know what it's like to collaborate.",
  ctaButtonLabel: 'Leave a Testimonial',
};

/** In display order (the cards of the Figma "Comments" row). */
const TESTIMONIALS = [
  {
    name: 'Ahmed Tarek',
    role: 'CTO · Orbit Analytics',
    message:
      "Yousef's work on our analytics API was transformative. Response times dropped by half. Every endpoint had a reason. Highly recommend for any data-heavy product.",
  },
  {
    name: 'Sara El-Masry',
    role: 'Product Manager · Fintech Startup',
    message:
      "Working with Yousef was a revelation. He doesn't just write endpoints — he designs entire systems. The final backend was secure, scalable, and exactly what we needed.",
  },
  {
    name: 'Nada Ashraf',
    role: 'Founder · Arcane Fashion',
    message:
      'He re-architected our e-commerce backend and checkout errors dropped 40% in the first month. His attention to caching and query performance was next level.',
  },
  {
    name: 'Karim Nour',
    role: 'Frontend Lead · SaaS Company',
    message:
      "I've worked with many backend engineers but few understand frontend needs the way Yousef does. Zero back-and-forth on contracts. His APIs are a developer's dream — clean, documented, predictable.",
  },
];

export default async function seedTestimonials() {
  await TestimonialsSection.findOneAndReplace({}, SECTION, { upsert: true, runValidators: true });

  // Matched by name + role, so re-running updates them instead of adding duplicates.
  await Promise.all(
    TESTIMONIALS.map((testimonial, order) =>
      Testimonial.findOneAndReplace(
        { name: testimonial.name, role: testimonial.role },
        { ...testimonial, order, status: 'published', source: 'admin', draft: null, publishedAt: new Date() },
        { upsert: true, runValidators: true },
      ),
    ),
  );

  return Testimonial.countDocuments();
}
