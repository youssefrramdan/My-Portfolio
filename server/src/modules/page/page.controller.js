import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { getPageState, publicPage, savePageLayout } from './page.service.js';

/** GET /api/page: `{ sections: [visible keys in display order], navLabels: { key: label } }`. */
export const getPage = asyncHandler(async (req, res) => {
  sendSuccess(res, await publicPage());
});

/**
 * GET /api/admin/page: every section `{ key, isVisible, navLabel, order, label, source, type, defaultNavLabel,
 * title, hasContent }` in display order, plus the live page `problems`.
 */
export const getAdminPage = asyncHandler(async (req, res) => {
  sendSuccess(res, await getPageState());
});

/** PUT /api/admin/page: saves order (= array position), visibility and navbar labels of all sections at once. */
export const updatePage = asyncHandler(async (req, res) => {
  sendSuccess(res, await savePageLayout(req.body.sections), 'Page layout updated');
});
