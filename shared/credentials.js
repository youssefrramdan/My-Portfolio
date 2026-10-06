import { filled } from './content.js';

/**
 * Credentials rules shared by the server and the dashboard. One list holds degrees, certificates, awards and
 * publications; every published `education` item (degree, diploma like ITI…) is a row of big cards on the site,
 * the rest are rows of the list card.
 */
export const CREDENTIAL_KINDS = ['education', 'certificate', 'award', 'publication'];

export const CREDENTIAL_LIMITS = {
  title: 100,
  issuer: 100,
  date: 40,
  detail: 160,
  link: 300,
  subject: 40,
  subjects: 12,
  /** Pill above an education title ("🎓 Degree", "ITI Diploma"); empty = `DEFAULT_EDUCATION_LABEL`. */
  label: 30,
  alt: 160,
};

/** Pill text of an education card when its `label` is empty. */
export const DEFAULT_EDUCATION_LABEL = '🎓 Degree';

/** Heading of the list card ("Certificates") in the Credentials "Main Details". */
export const CREDENTIALS_SECTION_LIMITS = { listTitle: 40 };

/** What blocks publishing a credential (`[{ field, message }]`). */
export function credentialPublishProblems(credential = {}) {
  const problems = [];
  if (!filled(credential.title)) problems.push({ field: 'title', message: 'Add a title' });
  if (!filled(credential.issuer)) problems.push({ field: 'issuer', message: 'Add the issuer' });
  if (!filled(credential.date)) problems.push({ field: 'date', message: 'Add a date' });
  return problems;
}
