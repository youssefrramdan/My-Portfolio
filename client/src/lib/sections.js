/** Ids of the page sections. Navbar links and in-page buttons scroll to these. */
export const SECTION = {
  about: 'about',
  projects: 'projects',
  skills: 'skills',
  education: 'education',
  testimonials: 'testimonials',
  contact: 'contact',
};

/** `key` = the page layout key (its navbar label can be renamed in the dashboard); `label` = the default. */
export const NAV_LINKS = [
  { key: 'hero', label: 'About', id: SECTION.about },
  { key: 'skills', label: 'Skills', id: SECTION.skills },
  { key: 'projects', label: 'Projects', id: SECTION.projects },
  { key: 'education', label: 'Education', id: SECTION.education },
  { key: 'testimonials', label: 'Testimonials', id: SECTION.testimonials },
  { key: 'contact', label: 'Contact', id: SECTION.contact },
];
