import SiteStatus from '../../src/modules/site/siteStatus.model.js';
import { assetByName, uploadAsset } from '../lib/uploadAsset.js';

const COMING_SOON = {
  badge: 'Coming Soon',
  title: { plain: 'Something good is', highlight: 'being built.' },
  message: 'The portfolio is being updated. Check back very soon.',
  description: 'Secure, scalable backends, built with care. Launching soon.',
  showEmail: true,
};

/**
 * The Coming Soon page is edited in Settings > Coming soon, so the seed only fills it while it has no title.
 * `isPublished` is only set on the first insert (schema default: published unless NODE_ENV is production) and the
 * image is uploaded from `seed/assets/coming-soon/coming-soon-image.*` only while it is empty.
 */
export default async function seedSite({ force }) {
  const existing = await SiteStatus.findOne().select('comingSoon').lean();
  const image = existing?.comingSoon?.image?.url
    ? existing.comingSoon.image
    : await uploadAsset(assetByName('coming-soon', 'coming-soon-image'), {
        folder: 'site',
        name: 'coming-soon-image',
        alt: 'Portfolio coming soon artwork',
        force,
        placeholder: false,
      });
  const copy = existing?.comingSoon?.title?.plain ? existing.comingSoon : COMING_SOON;

  await SiteStatus.findOneAndUpdate(
    {},
    { comingSoon: { ...copy, image } },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  return SiteStatus.countDocuments();
}
