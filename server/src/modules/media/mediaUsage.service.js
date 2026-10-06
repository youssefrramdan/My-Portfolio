import mongoose from 'mongoose';

/** Library collections themselves never count as "using" a file. */
const SKIPPED = new Set(['media', 'mediafolders']);

/** Where a collection shows in the dashboard (unknown ones fall back to their collection name). */
const PLACES = {
  heros: 'Identity',
  identitydrafts: 'Identity (draft)',
  projects: 'Work',
  skillcategories: 'Capabilities',
  credentials: 'Credentials',
  certificates: 'Credentials',
  educations: 'Credentials',
  testimonials: 'Testimonials',
  settings: 'Settings',
  sitestatuses: 'Coming soon page',
  users: 'Profile photo',
  sociallinks: 'Contact',
};

const placeOf = (collection) => PLACES[collection] ?? (collection.endsWith('sections') ? 'Page sections' : collection);

/**
 * `{ [publicId]: ['Work', 'Identity'] }` for the library files still referenced by the site content (published,
 * draft or settings). The portfolio holds a few dozen documents, so every content collection is scanned as JSON.
 * Password hashes are never read.
 */
export async function findUsage(publicIds) {
  const usage = Object.fromEntries(publicIds.map((publicId) => [publicId, new Set()]));
  const { db } = mongoose.connection;
  const collections = (await db.listCollections({}, { nameOnly: true }).toArray()).map(({ name }) => name).filter((name) => !SKIPPED.has(name));

  await Promise.all(
    collections.map(async (name) => {
      const documents = await db.collection(name).find({}, { projection: { passwordHash: 0 } }).toArray();
      const text = JSON.stringify(documents);
      publicIds.forEach((publicId) => {
        if (text.includes(publicId)) usage[publicId].add(placeOf(name));
      });
    }),
  );

  return Object.fromEntries(Object.entries(usage).map(([publicId, places]) => [publicId, [...places]]));
}
