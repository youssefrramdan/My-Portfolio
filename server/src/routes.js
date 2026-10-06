import { Router } from 'express';
import adminRoutes from './adminRoutes.js';
import { adminLimiter } from './middleware/rateLimit.js';
import requireAuth from './middleware/requireAuth.js';
import requirePublishedOrAdmin from './middleware/requirePublishedOrAdmin.js';
import authRoutes from './modules/auth/auth.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';
import educationRoutes from './modules/education/education.routes.js';
import heroRoutes from './modules/hero/hero.routes.js';
import pageRoutes from './modules/page/page.routes.js';
import projectsRoutes from './modules/projects/projects.routes.js';
import seoRoutes from './modules/seo/seo.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import siteRoutes from './modules/site/site.routes.js';
import skillsRoutes from './modules/skills/skills.routes.js';
import testimonialsRoutes from './modules/testimonials/testimonials.routes.js';
import { sendSuccess } from './utils/apiResponse.js';

const router = Router();

// Always reachable, published or not.
router.get('/health', (req, res) => sendSuccess(res, { status: 'ok' }));
router.use('/site-status', siteRoutes);
router.use('/auth', authRoutes);
// Crawlers and link previews; answers `noindex` while the site is unpublished.
router.use('/seo', seoRoutes);

// Public content: 503 for visitors while the site is unpublished (includes POST /testimonials).
router.use('/page', requirePublishedOrAdmin, pageRoutes);
router.use('/hero', requirePublishedOrAdmin, heroRoutes);
router.use('/settings', requirePublishedOrAdmin, settingsRoutes);
router.use('/skills', requirePublishedOrAdmin, skillsRoutes);
router.use('/projects', requirePublishedOrAdmin, projectsRoutes);
router.use('/education', requirePublishedOrAdmin, educationRoutes);
router.use('/testimonials', requirePublishedOrAdmin, testimonialsRoutes);
router.use('/contact', requirePublishedOrAdmin, contactRoutes);

router.use('/admin', adminLimiter, requireAuth, adminRoutes);

export default router;
