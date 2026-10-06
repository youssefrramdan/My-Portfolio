import { Router } from 'express';
import accountAdminRoutes from './modules/auth/account.admin.routes.js';
import contactAdminRoutes from './modules/contact/contact.admin.routes.js';
import credentialsAdminRoutes from './modules/education/credentials.admin.routes.js';
import identityAdminRoutes from './modules/identity/identity.admin.routes.js';
import mediaAdminRoutes from './modules/media/media.admin.routes.js';
import overviewRoutes from './modules/overview/overview.routes.js';
import pageAdminRoutes from './modules/page/page.admin.routes.js';
import projectsAdminRoutes from './modules/projects/projects.admin.routes.js';
import settingsAdminRoutes from './modules/settings/settings.admin.routes.js';
import siteAdminRoutes from './modules/site/site.admin.routes.js';
import skillsAdminRoutes from './modules/skills/skills.admin.routes.js';
import testimonialsAdminRoutes from './modules/testimonials/testimonials.admin.routes.js';

/** Everything here is mounted under `/api/admin` behind `requireAuth` (see routes.js). */
const router = Router();

router.use('/overview', overviewRoutes);
router.use('/site', siteAdminRoutes);
router.use('/page', pageAdminRoutes);
router.use('/identity', identityAdminRoutes);
router.use('/media', mediaAdminRoutes);
router.use('/projects', projectsAdminRoutes);
router.use('/skills', skillsAdminRoutes);
router.use('/credentials', credentialsAdminRoutes);
router.use('/testimonials', testimonialsAdminRoutes);
router.use('/contact', contactAdminRoutes);
router.use('/settings', settingsAdminRoutes);
router.use('/account', accountAdminRoutes);

export default router;
