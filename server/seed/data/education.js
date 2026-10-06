import Credential from '../../src/modules/education/credential.model.js';
import EducationSection from '../../src/modules/education/educationSection.model.js';
import { uploadAsset } from '../lib/uploadAsset.js';

/** Copy taken exactly from the Figma "Education & Learning" section (node 616:13931). */
const SECTION = {
  badge: 'Background',
  title: { plain: 'Education &', highlight: 'Learning.' },
  certificatesTitle: 'Certificates',
};

/**
 * In display order. Every `education` item is a row of big cards (with a photo: one wide card, else degree +
 * graduation cards); the others are rows of the certificates card (an empty `detail` renders as a dash).
 */
const CREDENTIALS = [
  {
    kind: 'education',
    label: '🎓 Degree',
    title: 'B.Sc. Computer Science',
    issuer: 'Faculty of Computers & Information — Menoufia University',
    date: '2025',
    detail: '4 years studying software engineering & CS fundamentals in Menoufia, Egypt.',
    subjects: ['OS', 'Software Engineering', 'Algorithms', 'Databases', 'OOP', 'Networks', 'Problem Solving'],
  },
  {
    kind: 'education',
    label: 'ITI Diploma',
    title: 'Full-Stack .NET Diploma',
    issuer: 'Information Technology Institute (ITI) — Menoufia, 9-Month Professional Diploma',
    date: '2025',
    subjects: ['Full-Stack .NET', 'ASP.NET Core', 'C#', 'SQL Server', 'Clean Architecture', 'Enterprise CRM', 'Software Engineering'],
    photo: { file: 'education/iti-diploma.png', name: 'iti-diploma', alt: 'Youssef with the ITI Full-Stack .NET track' },
  },
  { kind: 'certificate', title: 'AWS Certified Developer – Associate', issuer: 'AWS', date: 'October 2024' },
  { kind: 'certificate', title: 'Backend Development with Node.js', issuer: 'Maharah Tech', date: 'October 2023' },
  {
    kind: 'certificate',
    title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
    issuer: 'Udemy',
    detail: '42 total hours',
    date: 'August 2023',
  },
  {
    kind: 'certificate',
    title: 'Software Architecture & Clean Code Principles',
    issuer: 'LinkedIn Learning',
    detail: '3 hours 45 minutes',
    date: 'August 2025',
  },
];

export default async function seedEducation({ force }) {
  await EducationSection.findOneAndReplace({}, SECTION, { upsert: true, runValidators: true });

  // Matched by title + issuer, so re-running updates them instead of adding duplicates.
  await Promise.all(
    CREDENTIALS.map(async ({ photo, ...credential }, order) => {
      const image = photo ? await uploadAsset(photo.file, { folder: 'education', name: photo.name, alt: photo.alt, force }) : undefined;
      return Credential.findOneAndReplace(
        { title: credential.title, issuer: credential.issuer },
        { ...credential, ...(image && { image }), order, status: 'published', draft: null, publishedAt: new Date() },
        { upsert: true, runValidators: true },
      );
    }),
  );

  return Credential.countDocuments();
}
