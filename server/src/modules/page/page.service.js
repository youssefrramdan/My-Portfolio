import ContactSection from '../contact/contactSection.model.js';
import Credential from '../education/credential.model.js';
import EducationSection from '../education/educationSection.model.js';
import Hero from '../hero/hero.model.js';
import Project from '../projects/project.model.js';
import ProjectsSection from '../projects/projectsSection.model.js';
import Settings from '../settings/settings.model.js';
import SkillCategory from '../skills/skillCategory.model.js';
import SkillsSection from '../skills/skillsSection.model.js';
import Testimonial from '../testimonials/testimonial.model.js';
import TestimonialsSection from '../testimonials/testimonialsSection.model.js';
import { completeSections, navLabelOf, SECTION_BY_KEY, withSectionInfo } from './page.sections.js';
import PageLayout from './pageLayout.model.js';

const SINGLETON_UPDATE = { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true };

const headingText = (section) => [section?.title?.plain, section?.title?.highlight].filter(Boolean).join(' ');

export const loadSections = async () => {
  const layout = await PageLayout.findOne().select('sections').lean();
  return completeSections(layout?.sections);
};

/**
 * What each section shows on the live site: whether it has content (a section without any is hidden there
 * automatically), its public heading, and the buttons that scroll to other sections.
 */
export async function loadSectionContent() {
  const [hero, settings, contact, skills, projects, education, testimonials, groups, work, credentials, quotes] =
    await Promise.all([
      Hero.findOne().select('title ctaPrimary ctaSecondary').lean(),
      Settings.findOne().select('contactEmail').lean(),
      ContactSection.findOne().select('title primaryCta secondaryCta').lean(),
      SkillsSection.findOne().select('title').lean(),
      ProjectsSection.findOne().select('title').lean(),
      EducationSection.findOne().select('title').lean(),
      TestimonialsSection.findOne().select('title').lean(),
      SkillCategory.countDocuments({ status: 'published' }),
      Project.countDocuments({ status: 'published', featured: true }),
      Credential.countDocuments({ status: 'published' }),
      Testimonial.countDocuments({ status: 'published' }),
    ]);

  return {
    hasContent: {
      hero: Boolean(hero),
      skills: groups > 0,
      projects: work > 0,
      education: credentials > 0,
      testimonials: quotes > 0,
      contact: Boolean(contact && settings?.contactEmail),
    },
    titles: {
      hero: hero?.title ?? '',
      skills: headingText(skills),
      projects: headingText(projects),
      education: headingText(education),
      testimonials: headingText(testimonials),
      contact: headingText(contact),
    },
    ctas: [
      { key: 'hero', name: 'Hero primary button', cta: hero?.ctaPrimary },
      { key: 'hero', name: 'Hero secondary button', cta: hero?.ctaSecondary },
      { key: 'contact', name: 'Contact primary button', cta: contact?.primaryCta },
      { key: 'contact', name: 'Contact secondary button', cta: contact?.secondaryCta },
    ].filter((item) => item.cta?.label),
  };
}

/**
 * Problems of the live page (`[{ key, kind, message }]`): visible sections without content, and buttons of visible
 * sections that scroll to a section that is missing, hidden or empty.
 */
function pageProblems(sections, content) {
  const byAnchor = Object.fromEntries(sections.map((section) => [SECTION_BY_KEY[section.key].anchor, section]));
  const isShown = (section) => section.isVisible && content.hasContent[section.key];

  const empty = sections
    .filter((section) => section.isVisible && !content.hasContent[section.key])
    .map((section) => ({ key: section.key, kind: 'empty', message: 'Visible but empty — hidden automatically on the live site.' }));

  const targets = content.ctas
    .filter(({ key, cta }) => cta.action === 'scroll' && isShown(sections.find((section) => section.key === key)))
    .flatMap(({ key, name, cta }) => {
      const target = byAnchor[cta.target];
      if (!target) return [{ key, kind: 'cta', message: `${name} scrolls to "#${cta.target}", which is not on the page.` }];
      if (!isShown(target)) {
        return [{ key, kind: 'cta', message: `${name} scrolls to ${SECTION_BY_KEY[target.key].label}, which is not shown.` }];
      }
      return [];
    });

  return [...empty, ...targets];
}

/** Everything the Page screen needs: the section stack with content info, and the live page problems. */
export async function getPageState() {
  const [sections, content] = await Promise.all([loadSections(), loadSectionContent()]);
  return {
    sections: withSectionInfo(sections).map((section) => ({
      ...section,
      title: content.titles[section.key],
      hasContent: content.hasContent[section.key],
    })),
    problems: pageProblems(sections, content),
  };
}

/** Saves order (= array position), visibility and navbar labels; a missing `navLabel` keeps the stored one. */
export async function savePageLayout(input) {
  const stored = Object.fromEntries((await loadSections()).map((section) => [section.key, section]));
  const sections = input.map(({ key, isVisible, navLabel }, order) => ({
    key,
    isVisible,
    navLabel: navLabel ?? stored[key]?.navLabel ?? '',
    order,
  }));
  await PageLayout.findOneAndUpdate({}, { sections }, SINGLETON_UPDATE);
  return getPageState();
}

/** Public: keys of the visible sections in display order + the navbar label of each. */
export async function publicPage() {
  const visible = (await loadSections()).filter((section) => section.isVisible);
  return {
    sections: visible.map((section) => section.key),
    navLabels: Object.fromEntries(visible.map((section) => [section.key, navLabelOf(section)])),
  };
}
