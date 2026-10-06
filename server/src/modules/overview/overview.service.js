import { MIN_SOCIALS } from '../../../../shared/contact.js';
import { identityCompletion } from '../../../../shared/identity.js';
import Credential from '../education/credential.model.js';
import Hero from '../hero/hero.model.js';
import { toIdentity } from '../identity/identity.service.js';
import Media from '../media/media.model.js';
import { withSectionInfo } from '../page/page.sections.js';
import { loadSectionContent, loadSections } from '../page/page.service.js';
import Project from '../projects/project.model.js';
import Settings from '../settings/settings.model.js';
import { resolveSiteUrl } from '../settings/settings.service.js';
import SocialLink from '../settings/socialLink.model.js';
import SiteStatus, { DEFAULT_IS_PUBLISHED } from '../site/siteStatus.model.js';
import SkillCategory from '../skills/skillCategory.model.js';
import Testimonial from '../testimonials/testimonial.model.js';
import { RECENT_WORK_LIMIT, SETUP_ITEMS } from './overview.constants.js';

const isIdentityComplete = (hero, settings) => identityCompletion(toIdentity(hero, settings)).percent === 100;

/** Recent work card: the working copy (draft first), so a new item shows what is being written. */
const toRecentWork = (project) => {
  const work = project.draft ?? project;
  return {
    _id: project._id,
    title: work.title ?? '',
    subtitle: work.tags?.[0] ?? '',
    coverImage: work.coverImage,
    updatedAt: project.updatedAt,
    isLive: project.status === 'published',
  };
};

async function countSkillItems() {
  const [result] = await SkillCategory.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: null, total: { $sum: { $size: '$items' } } } },
  ]);
  return result?.total ?? 0;
}

/** Everything the dashboard Overview needs, in one round of parallel queries. */
export async function getOverview() {
  const [
    hero,
    settings,
    socials,
    workItems,
    skillItems,
    credentials,
    testimonials,
    pendingTestimonials,
    recentProjects,
    siteStatus,
    sections,
    content,
    mediaCount,
  ] = await Promise.all([
    Hero.findOne().lean(),
    Settings.findOne().select('contactEmail avatar cv siteUrl').lean(),
    SocialLink.countDocuments({ isActive: true }),
    Project.countDocuments(),
    countSkillItems(),
    Credential.countDocuments({ status: 'published' }),
    Testimonial.countDocuments({ status: 'published' }),
    Testimonial.countDocuments({ status: 'pending' }),
    Project.find()
      .sort({ updatedAt: -1 })
      .limit(RECENT_WORK_LIMIT)
      .select('title tags coverImage draft status updatedAt')
      .lean(),
    SiteStatus.findOne().select('isPublished publishedAt').lean(),
    loadSections(),
    loadSectionContent(),
    Media.countDocuments(),
  ]);

  const isPublished = siteStatus?.isPublished ?? DEFAULT_IS_PUBLISHED;
  const { hasContent } = content;

  const doneByKey = {
    identity: isIdentityComplete(hero, settings),
    contact: Boolean(settings?.contactEmail) && socials >= MIN_SOCIALS,
    work: hasContent.projects,
    capabilities: hasContent.skills,
    credentials: hasContent.education,
    testimonials: hasContent.testimonials,
    published: isPublished,
  };

  const setupItems = SETUP_ITEMS.map((item) => ({ ...item, done: doneByKey[item.key] }));
  const done = setupItems.filter((item) => item.done).length;

  return {
    counts: {
      work: workItems,
      capabilities: skillItems,
      credentials,
      testimonials,
      pendingTestimonials,
    },
    recentWork: recentProjects.map(toRecentWork),
    sections: withSectionInfo(sections).map((section) => ({ ...section, hasContent: hasContent[section.key] })),
    setup: {
      done,
      total: setupItems.length,
      percent: Math.round((done / setupItems.length) * 100),
      items: setupItems,
    },
    media: { count: mediaCount },
    site: { isPublished, publishedAt: siteStatus?.publishedAt ?? null, url: resolveSiteUrl(settings) },
  };
}
