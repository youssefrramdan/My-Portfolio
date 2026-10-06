import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import Hero from './hero.model.js';

const HIDDEN_FIELDS = '-__v -createdAt -updatedAt';

/**
 * GET /api/hero: the published hero, or null until it is seeded or published from the dashboard.
 * Skill tags / stats switched off in Identity come back as empty lists, so the site simply skips them.
 */
export const getHero = asyncHandler(async (req, res) => {
  const hero = await Hero.findOne().select(HIDDEN_FIELDS).lean();
  if (!hero) return sendSuccess(res, null);

  const { showSkillTags = true, showStats = true, ...rest } = hero;
  sendSuccess(res, {
    ...rest,
    skillTags: showSkillTags ? rest.skillTags : [],
    stats: showStats ? rest.stats : [],
  });
});
