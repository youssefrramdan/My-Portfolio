import Hero from '../../src/modules/hero/hero.model.js';
import { uploadAsset } from '../lib/uploadAsset.js';

const FOLDER = 'hero';

/**
 * Copy taken exactly from the Figma Hero frame (MUHAMED-Portfolio, node 616:13834 "Portfolio – Yousef Ramadan").
 * Replaces the published hero; an unpublished Identity draft is left alone.
 */
export default async function seedHero({ force }) {
  const [photo, apiBoard, systemDesign] = await Promise.all([
    uploadAsset('hero/main-image.png', {
      folder: FOLDER,
      name: 'main-image',
      alt: 'Youssef Ramadan in front of a macOS dock',
      force,
    }),
    uploadAsset('hero/inline-a.png', {
      folder: FOLDER,
      name: 'inline-a',
      alt: 'API design board',
      force,
    }),
    uploadAsset('hero/inline-b.png', {
      folder: FOLDER,
      name: 'inline-b',
      alt: 'System design page',
      force,
    }),
  ]);

  const data = {
    role: 'Backend Software Engineer',
    title: 'I Build Systems Not Just APIs',
    intro:
      "I'm a backend software engineer who thinks in systems and speaks in APIs.\n" +
      'Because I care about how software runs in production, my services are secure, scalable, and reliable, ' +
      'no surprises, no downtime, no "it works on my machine."',
    photo,
    backgroundText: 'YOUSEF RAMADAN',
    headline: {
      lineBreak: { word: 'Systems', occurrence: 0 },
      imageSlots: [
        { word: 'Build', occurrence: 0, images: [apiBoard, systemDesign] },
        { word: 'Not', occurrence: 0, images: [systemDesign, apiBoard] },
      ],
    },
    showSkillTags: true,
    showStats: true,
    skillTags: [
      { label: 'Backend Development', icon: 'pen-tool' },
      { label: 'REST APIs', icon: 'pen-tool' },
      { label: 'System Architecture', icon: 'brain' },
      { label: 'Database Design', icon: 'search' },
      { label: 'Auth · OAuth 2.0 & JWT', icon: 'glasses' },
      { label: 'Clean Architecture', icon: 'triangle' },
      { label: 'Cloud & Deployment', icon: 'zap' },
    ],
    stats: [
      { label: 'Total', number: 15, suffix: '+', title: 'APIs Shipped' },
      { label: 'Avg.', number: 30, suffix: '%', title: 'Faster Queries' },
      { label: 'Experience', number: 1, suffix: '+', title: 'Years' },
    ],
    ctaPrimary: { label: 'View my work', action: 'scroll', target: 'projects' },
    ctaSecondary: { label: 'Get in touch', action: 'scroll', target: 'contact' },
  };

  await Hero.findOneAndReplace({}, data, { upsert: true, runValidators: true });
  return Hero.countDocuments();
}
