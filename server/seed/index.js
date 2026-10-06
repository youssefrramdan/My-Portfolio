import { connectDB, disconnectDB } from '../src/config/db.js';
import logger from '../src/config/logger.js';
import seedAdmin from './data/admin.js';
import seedContact from './data/contact.js';
import seedEducation from './data/education.js';
import seedHero from './data/hero.js';
import seedMedia from './data/media.js';
import seedPage from './data/page.js';
import seedProjects from './data/projects.js';
import seedSettings from './data/settings.js';
import seedSite from './data/site.js';
import seedSkills from './data/skills.js';
import seedSocials from './data/socials.js';
import seedTestimonials from './data/testimonials.js';
import { getMissingAssets } from './lib/uploadAsset.js';

/**
 * Idempotent seed: every seeder upserts its documents, so running it again never duplicates.
 *   npm run seed                 -> all seeders
 *   npm run seed -- hero         -> only the listed seeders
 *   npm run seed:admin           -> only the admin account (same as `npm run seed -- admin`)
 *   npm run seed -- --force      -> re-upload images even if they already exist on Cloudinary
 */
const seeders = {
  settings: seedSettings,
  socials: seedSocials,
  hero: seedHero,
  skills: seedSkills,
  projects: seedProjects,
  media: seedMedia,
  education: seedEducation,
  testimonials: seedTestimonials,
  contact: seedContact,
  page: seedPage,
  site: seedSite,
  admin: seedAdmin,
};

const args = process.argv.slice(2);
const force = args.includes('--force');
const selected = args.filter((arg) => !arg.startsWith('--'));
const names = selected.length ? selected : Object.keys(seeders);

const unknown = names.filter((name) => !seeders[name]);
if (unknown.length) {
  logger.error(`Unknown seeder(s): ${unknown.join(', ')}. Available: ${Object.keys(seeders).join(', ')}`);
  process.exit(1);
}

await connectDB();
try {
  for (const name of names) {
    const count = await seeders[name]({ force });
    logger.info(`Seeded ${name} (documents in collection: ${count})`);
  }
  const missing = getMissingAssets();
  if (missing.length) logger.warn(`Missing seed assets: ${missing.join(', ')}`);
} catch (error) {
  logger.error(`Seed failed: ${error.message}`, { stack: error.stack });
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
