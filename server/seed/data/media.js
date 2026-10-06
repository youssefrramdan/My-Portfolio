import Hero from '../../src/modules/hero/hero.model.js';
import Media from '../../src/modules/media/media.model.js';
import Project from '../../src/modules/projects/project.model.js';
import Settings from '../../src/modules/settings/settings.model.js';

const isCloudinary = (url) => typeof url === 'string' && url.includes('res.cloudinary.com');

/**
 * Registers the images already used by the hero, settings and work items in the media library, so "Choose media"
 * can offer them. Upserts by `publicId`; placeholder images (missing seed assets) are skipped.
 * Run after `hero` / `settings` / `projects`.
 */
export default async function seedMedia() {
  const [hero, settings, projects] = await Promise.all([
    Hero.findOne().lean(),
    Settings.findOne().lean(),
    Project.find().select('coverImage gallery').lean(),
  ]);

  const images = [
    hero?.photo,
    ...(hero?.headline?.imageSlots ?? []).flatMap((slot) => slot.images),
    settings?.avatar,
    ...projects.flatMap((project) => [project.coverImage, ...(project.gallery ?? [])]),
  ].filter((image) => image?.publicId && isCloudinary(image.url));

  const unique = [...new Map(images.map((image) => [image.publicId, image])).values()];
  await Promise.all(
    unique.map((image) =>
      Media.findOneAndUpdate(
        { publicId: image.publicId },
        {
          $set: { url: image.url, kind: 'image', format: image.url.split('.').pop()?.toLowerCase() ?? '' },
          $setOnInsert: { name: image.publicId.split('/').pop() },
        },
        { upsert: true, runValidators: true, setDefaultsOnInsert: true },
      ),
    ),
  );
  return Media.countDocuments();
}
