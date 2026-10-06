/** Fixed UI text of the project page (documented exception to "no hardcoded text"). */
export const PROJECT_TEXT = {
  close: 'Close project',
  backHome: 'Back to home',
  actions: 'Project actions',
  notFound: 'Project not found',
  notFoundText: 'This project is not available right now.',
  loading: 'Loading project…',
  imageAlt: (title, index) => `${title}, image ${index}`,
  moreTags: (labels) => `and ${labels.join(', ')}`,
  allProjects: 'All Projects',
  allPrefix: 'All',
  viewAll: 'View all projects',
  scrollToEnd: 'Scroll to the last projects',
  loadingAll: 'Loading projects…',
  noProjects: 'No projects to show yet.',
};
