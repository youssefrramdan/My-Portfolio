import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import logger from '../src/config/logger.js';
import { SITE_DEFAULTS } from './data/settings.js';

/**
 * One-off, idempotent data migration to the draft / publish content modules (`npm run migrate`):
 *   - skill groups: `isActive` -> `status` (+ `publishedAt` for live ones)
 *   - testimonials: `approved` -> `published`, `hidden` -> `draft` (both keep their live content); a missing
 *     `source` becomes `visitor` for pending ones, else `admin`
 *   - credentials: the old degree document + certificates are copied into `credentials` when it is still empty
 *   - settings: an empty site name / SEO title / SEO description gets the Figma default
 * The old `educations` / `certificates` collections are left untouched.
 */
async function migrateSettings(db) {
  const settings = db.collection('settings');
  const updates = [
    ['siteName', SITE_DEFAULTS.siteName],
    ['seo.title', SITE_DEFAULTS.seo.title],
    ['seo.description', SITE_DEFAULTS.seo.description],
  ];
  const results = await Promise.all(
    updates.map(([field, value]) => settings.updateOne({ $or: [{ [field]: { $exists: false } }, { [field]: '' }] }, { $set: { [field]: value } })),
  );
  return `${results.reduce((sum, result) => sum + result.modifiedCount, 0)} default(s) filled`;
}

async function migrateSkills(db) {
  const groups = db.collection('skillcategories');
  const live = await groups.updateMany(
    { isActive: true },
    [{ $set: { status: 'published', publishedAt: '$updatedAt', draft: null } }, { $unset: 'isActive' }],
  );
  const hidden = await groups.updateMany(
    { isActive: { $exists: true } },
    [{ $set: { status: 'draft', publishedAt: '$updatedAt', draft: null } }, { $unset: 'isActive' }],
  );
  return `${live.modifiedCount} live, ${hidden.modifiedCount} hidden`;
}

async function migrateTestimonials(db) {
  const testimonials = db.collection('testimonials');
  const approved = await testimonials.updateMany({ status: 'approved' }, [
    { $set: { status: 'published', publishedAt: '$updatedAt', draft: null } },
  ]);
  const hidden = await testimonials.updateMany({ status: 'hidden' }, [
    { $set: { status: 'draft', publishedAt: '$updatedAt', draft: null } },
  ]);
  // Before `source` existed, pending ones could only come from the public form.
  const visitors = await testimonials.updateMany({ source: { $exists: false }, status: 'pending' }, { $set: { source: 'visitor' } });
  const admins = await testimonials.updateMany({ source: { $exists: false } }, { $set: { source: 'admin' } });
  return [
    `${approved.modifiedCount} approved -> published`,
    `${hidden.modifiedCount} hidden -> draft`,
    `source set on ${visitors.modifiedCount} visitor + ${admins.modifiedCount} admin`,
  ].join(', ');
}

async function migrateCredentials(db) {
  const credentials = db.collection('credentials');
  if (await credentials.countDocuments()) return 'already migrated';

  const [degree, certificates] = await Promise.all([
    db.collection('educations').findOne(),
    db.collection('certificates').find().sort({ order: 1, createdAt: 1 }).toArray(),
  ]);
  const now = new Date();
  const base = (doc, isLive) => ({
    status: isLive ? 'published' : 'draft',
    link: '',
    draft: null,
    publishedAt: doc.updatedAt ?? now,
    createdAt: doc.createdAt ?? now,
    updatedAt: doc.updatedAt ?? now,
  });

  const docs = [
    ...(degree
      ? [
          {
            ...base(degree, true),
            kind: 'education',
            title: degree.degreeTitle ?? '',
            issuer: degree.institution ?? '',
            date: degree.graduationYear ?? '',
            detail: degree.graduationDescription ?? '',
            subjects: (degree.subjects ?? [])
              .filter((subject) => subject.isActive !== false)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((subject) => subject.label),
          },
        ]
      : []),
    ...certificates.map((certificate) => ({
      ...base(certificate, certificate.isActive !== false),
      kind: 'certificate',
      title: certificate.title ?? '',
      issuer: certificate.issuer ?? '',
      date: certificate.date ?? '',
      detail: certificate.detail ?? '',
      subjects: [],
    })),
  ].map((doc, order) => ({ ...doc, order }));

  if (docs.length) await credentials.insertMany(docs);
  return `${docs.length} copied`;
}

await connectDB();
try {
  const { db } = mongoose.connection;
  logger.info(`Skill groups: ${await migrateSkills(db)}`);
  logger.info(`Testimonials: ${await migrateTestimonials(db)}`);
  logger.info(`Credentials: ${await migrateCredentials(db)}`);
  logger.info(`Settings: ${await migrateSettings(db)}`);
} catch (error) {
  logger.error(`Migration failed: ${error.message}`, { stack: error.stack });
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
