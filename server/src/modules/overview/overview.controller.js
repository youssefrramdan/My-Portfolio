import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { getOverview as buildOverview } from './overview.service.js';

/** GET /api/admin/overview */
export const getOverview = asyncHandler(async (req, res) => {
  sendSuccess(res, await buildOverview());
});
