import { OG_IMAGE_SIZE } from '../../../../shared/settings.js';
import { cloudinaryUrl } from '../../utils/cloudinaryUrl.js';
import Hero from '../hero/hero.model.js';
import Project from '../projects/project.model.js';
import { getProjectsSection } from '../projects/projects.service.js';
import Settings from '../settings/settings.model.js';
import { resolveSiteUrl } from '../settings/settings.service.js';
import SocialLink from '../settings/socialLink.model.js';
import SiteStatus, { DEFAULT_IS_PUBLISHED } from '../site/siteStatus.model.js';

const LANG = 'en';
const LOCALE = 'en_US';
const INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NO_INDEX = 'noindex, nofollow';
const PROJECT_PATH = /^\/projects\/([a-z0-9-]+)\/?$/;
const ALL_PROJECTS_PATH = /^\/projects\/?$/;
/** Same heading as the page (`PROJECT_TEXT.allProjects` in the client). */
const ALL_PROJECTS_TITLE = 'All projects';
const SCHEMA = 'https://schema.org';

const clip = (text = '', max = 160) => {
  const value = String(text).replace(/\s+/g, ' ').trim();
  return value.length <= max ? value : `${value.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

const shareImage = (image, fallbackAlt) =>
  image?.url
    ? {
        url: cloudinaryUrl(image.url, `c_fill,g_auto,w_${OG_IMAGE_SIZE.width},h_${OG_IMAGE_SIZE.height},f_jpg,q_auto`),
        width: OG_IMAGE_SIZE.width,
        height: OG_IMAGE_SIZE.height,
        alt: image.alt || fallbackAlt,
      }
    : null;

const icon = (image, size) => (image?.url ? cloudinaryUrl(image.url, `c_fill,w_${size},h_${size},f_png`) : '');

/** Shipped with the site (`client/public`, made from the navbar logo), used until a favicon is set in Settings > SEO. */
const DEFAULT_ICONS = { favicon: '/favicon.png', appleTouchIcon: '/apple-touch-icon.png' };

/** Settings, hero, socials and publish state, read once per request. */
async function loadSite() {
  const [settings, hero, socials, status] = await Promise.all([
    Settings.findOne().select('siteName siteUrl seo favicon').lean(),
    Hero.findOne().select('backgroundText role intro photo').lean(),
    SocialLink.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).select('url -_id').lean(),
    SiteStatus.findOne().select('isPublished').lean(),
  ]);
  const url = resolveSiteUrl(settings);
  const siteName = settings?.siteName || hero?.backgroundText || new URL(url).hostname;
  return {
    settings,
    hero,
    url,
    siteName,
    personName: hero?.backgroundText || siteName,
    sameAs: socials.map((social) => social.url),
    isPublished: status?.isPublished ?? DEFAULT_IS_PUBLISHED,
  };
}

function basePage(site) {
  const { settings, url, siteName, isPublished } = site;
  return {
    status: 200,
    lang: LANG,
    locale: LOCALE,
    siteName,
    robots: isPublished ? INDEX : NO_INDEX,
    favicon: icon(settings?.favicon, 48) || DEFAULT_ICONS.favicon,
    appleTouchIcon: icon(settings?.favicon, 180) || DEFAULT_ICONS.appleTouchIcon,
    verification: { google: settings?.seo?.googleVerification ?? '' },
    canonical: `${url}/`,
  };
}

function person(site) {
  const { hero, url, personName, sameAs } = site;
  return {
    '@type': 'Person',
    '@id': `${url}/#person`,
    name: personName,
    url: `${url}/`,
    ...(hero?.role && { jobTitle: hero.role }),
    ...(hero?.photo?.url && { image: cloudinaryUrl(hero.photo.url, 'c_limit,w_800,f_jpg,q_auto') }),
    ...(sameAs.length && { sameAs }),
  };
}

function homePage(site) {
  const { settings, hero, url, siteName } = site;
  const description = clip(settings?.seo?.description || hero?.intro || '');
  return {
    ...basePage(site),
    type: 'website',
    title: settings?.seo?.title || siteName,
    description,
    image: shareImage(settings?.seo?.image?.url ? settings.seo.image : hero?.photo, siteName),
    jsonLd: [
      { '@context': SCHEMA, '@type': 'WebSite', '@id': `${url}/#website`, name: siteName, url: `${url}/`, inLanguage: LANG },
      {
        '@context': SCHEMA,
        '@type': 'ProfilePage',
        '@id': `${url}/#profile`,
        url: `${url}/`,
        name: settings?.seo?.title || siteName,
        ...(description && { description }),
        inLanguage: LANG,
        isPartOf: { '@id': `${url}/#website` },
        mainEntity: person(site),
      },
    ],
  };
}

function projectPage(site, project) {
  const { settings, url, siteName, personName } = site;
  const pageUrl = `${url}/projects/${project.slug}`;
  const description = clip(project.description || settings?.seo?.description || '');
  const image = shareImage(project.coverImage?.url ? project.coverImage : settings?.seo?.image, project.title);
  return {
    ...basePage(site),
    type: 'article',
    title: `${project.title} | ${siteName}`,
    description,
    canonical: pageUrl,
    image,
    jsonLd: [
      {
        '@context': SCHEMA,
        '@type': 'CreativeWork',
        '@id': `${pageUrl}#work`,
        name: project.title,
        url: pageUrl,
        ...(description && { description }),
        ...(image && { image: image.url }),
        ...(project.year && { dateCreated: String(project.year) }),
        ...(project.tags?.length && { keywords: project.tags.join(', ') }),
        ...(project.publishedAt && { datePublished: project.publishedAt.toISOString() }),
        dateModified: project.updatedAt.toISOString(),
        inLanguage: LANG,
        author: { '@type': 'Person', '@id': `${url}/#person`, name: personName, url: `${url}/` },
      },
      {
        '@context': SCHEMA,
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: siteName, item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: project.title, item: pageUrl },
        ],
      },
    ],
  };
}

function allProjectsPage(site, section) {
  const { settings, url, siteName } = site;
  const pageUrl = `${url}/projects`;
  const heading = ALL_PROJECTS_TITLE;
  const description = clip(section?.description || settings?.seo?.description || '');
  return {
    ...basePage(site),
    type: 'website',
    title: `${heading} | ${siteName}`,
    description,
    canonical: pageUrl,
    image: shareImage(settings?.seo?.image, siteName),
    jsonLd: [
      {
        '@context': SCHEMA,
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: heading,
        ...(description && { description }),
        inLanguage: LANG,
        isPartOf: { '@id': `${url}/#website` },
      },
      {
        '@context': SCHEMA,
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: siteName, item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: heading, item: pageUrl },
        ],
      },
    ],
  };
}

function notFoundPage(site, path) {
  return {
    ...homePage(site),
    status: 404,
    title: `Page not found | ${site.siteName}`,
    robots: NO_INDEX,
    canonical: `${site.url}${path}`,
    jsonLd: [],
  };
}

const findPublishedProject = (slug) =>
  Project.findOne({ slug, status: 'published' }).select('slug title description coverImage year tags publishedAt updatedAt').lean();

/**
 * Head metadata for a public path: the home page, the all-projects page, a published project page, or a 404 (`status`). While the site is
 * unpublished every page is `noindex` and project pages are not revealed.
 */
export async function getPageSeo(path = '/') {
  const site = await loadSite();
  const clean = `/${String(path).split(/[?#]/)[0].replace(/^\/+/, '')}`;
  if (clean === '/') return homePage(site);
  if (ALL_PROJECTS_PATH.test(clean)) return allProjectsPage(site, await getProjectsSection());
  const slug = clean.match(PROJECT_PATH)?.[1];
  const project = slug && site.isPublished ? await findPublishedProject(slug) : null;
  return project ? projectPage(site, project) : notFoundPage(site, clean);
}

const xmlEscape = (value) => String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** sitemap.xml: the home page, the all-projects page and every published project page (none while unpublished). */
export async function getSitemap() {
  const site = await loadSite();
  const projects = site.isPublished
    ? (await Project.find({ status: 'published' }).sort({ order: 1 }).select('slug updatedAt').lean()).filter((project) => project.slug)
    : [];
  const home = await Settings.findOne().select('updatedAt').lean();
  const urls = [
    { loc: `${site.url}/`, lastmod: home?.updatedAt },
    ...(projects.length ? [{ loc: `${site.url}/projects` }] : []),
    ...projects.map((project) => ({ loc: `${site.url}/projects/${project.slug}`, lastmod: project.updatedAt })),
  ];
  const entries = urls
    .map(({ loc, lastmod }) => `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod.toISOString()}</lastmod>` : ''}\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

/** robots.txt: everything but the dashboard, plus the sitemap address. */
export async function getRobots() {
  const settings = await Settings.findOne().select('siteUrl').lean();
  const url = resolveSiteUrl(settings);
  return ['User-agent: *', 'Allow: /', 'Disallow: /admin', '', `Sitemap: ${url}/sitemap.xml`, ''].join('\n');
}
