/** Admin shell chrome (sidebar, topbar, drawer, placeholder). Admin UI text is kept here, not in the database. */
export const SHELL = {
  brandSubtitle: 'Portfolio CMS',
  workspaceLabel: 'Workspace',
  skipToContent: 'Skip to content',
  navLabel: 'Admin',
  openMenu: 'Open navigation',
  closeMenu: 'Close navigation',
  userMenu: 'Account menu',
  logout: 'Log out',
  loggingOut: 'Logging out…',
  preview: 'Preview',
  previewLabel: 'Preview the public site (opens in a new tab)',
  copyDomain: 'Copy site address',
  copied: 'Copied',
  copyFailed: 'Copy failed',
  liveSite: 'Site address',
  contentCount: (count) => `${count} items`,
};

/** Publish / unpublish controls (topbar, Overview health card, Publish status card) and their dialogs. */
export const PUBLISH = {
  publish: 'Publish',
  publishing: 'Publishing…',
  published: 'Published',
  unpublish: 'Unpublish',
  unpublishing: 'Unpublishing…',
  unpublishLabel: 'Published. Unpublish the site',
  cancel: 'Cancel',
  publishedNotice: 'Your portfolio is live.',
  unpublishedNotice: 'Your portfolio is unpublished. Visitors now see the Coming Soon page.',
  confirmPublish: {
    title: 'Publish your portfolio?',
    description: (host) => `Visitors will see the full site at ${host} right away.`,
    unfinished: 'These setup steps are not finished yet. You can still publish and complete them later:',
  },
  confirmUnpublish: {
    title: 'Unpublish your portfolio?',
    description:
      'Visitors will see the Coming Soon page until you publish again. You can still preview the full site while you are logged in.',
  },
  error: 'Could not update the site status. Please try again.',
  status: {
    eyebrow: 'Publish status',
    live: 'Live',
    draft: 'Draft changes',
    liveUrl: 'Live URL',
  },
};

export const SESSION = {
  checking: 'Checking your session…',
  errorTitle: 'Could not reach the server',
  errorMessage: 'Check your connection and try again.',
  retry: 'Try again',
};

export const PLACEHOLDER = {
  eyebrow: 'Coming soon',
  title: (name) => `${name} is on the way.`,
  description: 'This area of the dashboard is being built. Everything you add here will show on your portfolio.',
  back: 'Back to overview',
};
