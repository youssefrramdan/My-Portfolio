import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { getContactSection, getContactState, saveContact, updateContactSection } from './contact.service.js';

/** GET /api/contact: `{ section }`, null until seeded or saved from the dashboard. */
export const getContact = asyncHandler(async (req, res) => {
  sendSuccess(res, { section: await getContactSection() });
});

/** GET /api/admin/contact: `{ contactEmail, socials, section, sections }`. */
export const getAdminContact = asyncHandler(async (req, res) => {
  sendSuccess(res, await getContactState());
});

/** PUT /api/admin/contact: email + social links + buttons, live right away (the page autosaves). */
export const updateAdminContact = asyncHandler(async (req, res) => {
  sendSuccess(res, await saveContact(req.body), 'Contact saved');
});

/** PUT /api/admin/contact/section */
export const updateSection = asyncHandler(async (req, res) => {
  sendSuccess(res, await updateContactSection(req.body), 'Section saved');
});
