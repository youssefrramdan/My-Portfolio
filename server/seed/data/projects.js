import { DEFAULT_LINK_LABEL } from '../../../shared/work.js';
import Project from '../../src/modules/projects/project.model.js';
import ProjectsSection, { DEFAULT_CARD_CTA_LABEL } from '../../src/modules/projects/projectsSection.model.js';
import { assetByName, uploadAsset } from '../lib/uploadAsset.js';

const FOLDER = 'projects';

/** Heading copy taken exactly from the Figma "Selected Projects" section (node 616:13930). */
export const SECTION = {
  badge: 'Explore My Work',
  title: { plain: 'Selected', highlight: 'Projects' },
  description: 'Each project starts with a real problem and ends with a reliable system. Scroll down to explore the work.',
  scrollButtonLabel: 'Scroll to explore',
  cardCtaLabel: DEFAULT_CARD_CTA_LABEL,
};

/**
 * Display order matches the Figma covers. The slug is fixed so the upsert keeps matching
 * after the titles below are replaced with the real copy.
 */
const PROJECTS = [
  {
    slug: 'gadora',
    cover: 'project-gadora',
    // TODO: replace with the real Gadora copy, year and tags.
    title: 'Gadora — Real Estate Rental Web App',
    description: 'A real estate rental website with a clean search and listing experience.',
    year: 2026,
    tags: ['Figma', 'Web'],
  },
  {
    slug: 'quran-app',
    cover: 'project-quran-app',
    // TODO: replace with the real Quran App copy, year and tags.
    title: 'Quran App',
    description: 'A calm mobile reading experience for the Quran with clear typography.',
    year: 2026,
    tags: ['Figma', 'iOS'],
  },
  {
    slug: 'redesign-before-after',
    cover: 'project-before-after',
    // TODO: replace with the real Before / After redesign copy, year and tags.
    title: 'Redesign — Before & After',
    description: 'A redesign case showing the improved structure and visual hierarchy.',
    year: 2026,
    tags: ['Figma', 'Web'],
  },
  {
    slug: 'oxilla',
    cover: 'project-oxilla',
    // TODO: replace with the real Oxilla copy, year and tags.
    title: 'Oxilla — Cosmetics Store',
    description: 'An e-commerce experience that combines trust and convenience.',
    year: 2026,
    tags: ['Figma', 'Web'],
  },
];

/**
 * Starter content for an empty database only: the real work items (copied from another portfolio or added in the
 * dashboard) are never overwritten, and an existing section heading is kept.
 */
export default async function seedProjects({ force }) {
  // The slug index became sparse (drafts have no slug yet); rebuild indexes that changed.
  await Project.syncIndexes();
  if (!(await ProjectsSection.exists({}))) await ProjectsSection.create(SECTION);
  if (await Project.exists({})) return Project.countDocuments();

  const covers = await Promise.all(
    PROJECTS.map(({ cover, title }) =>
      uploadAsset(assetByName('projects', cover), { folder: FOLDER, name: cover, alt: `${title} cover`, force }),
    ),
  );

  await Promise.all(
    PROJECTS.map(({ cover, ...project }, order) =>
      Project.findOneAndReplace(
        { slug: project.slug },
        {
          ...project,
          status: 'published',
          coverImage: covers[order],
          role: '',
          client: '',
          externalLink: '',
          linkLabel: DEFAULT_LINK_LABEL,
          featured: true,
          // TODO: replace with the real case study images (the cover stands in until then).
          gallery: [{ ...covers[order], layout: 'full' }],
          draft: null,
          order,
          publishedAt: new Date(),
        },
        { upsert: true, runValidators: true },
      ),
    ),
  );

  return Project.countDocuments();
}
