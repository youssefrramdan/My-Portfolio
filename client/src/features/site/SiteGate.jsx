import { Outlet, useSearchParams } from 'react-router-dom';
import { useDocumentSeo } from '@/features/seo/useDocumentSeo';
import ComingSoonPage from './ComingSoonPage';
import { SITE_STATUS_TEXT } from './labels';
import PreviewPill from './PreviewPill';
import { useSiteStatus } from './useSiteStatus';

/** `/?preview=coming-soon` shows the logged-in admin the Coming Soon page (Settings > Coming soon "Preview"). */
export const COMING_SOON_PREVIEW = { param: 'preview', value: 'coming-soon' };

/**
 * Layout route for the public pages. Visitors of an unpublished site get only the Coming Soon page (no navbar,
 * footer or section requests); the logged-in admin gets the full site plus a preview notice. If the status
 * itself cannot be loaded, the site renders and each section shows its own error state.
 */
export default function SiteGate() {
  useDocumentSeo();
  const { data: status, isPending, isError } = useSiteStatus();
  const [params] = useSearchParams();

  if (isPending) {
    return (
      <div role="status" className="min-h-dvh bg-bg-primary">
        <span className="sr-only">{SITE_STATUS_TEXT.loading}</span>
      </div>
    );
  }
  if (!isError && !status.isPublished && !status.isAdmin) return <ComingSoonPage status={status} />;
  if (!isError && status.isAdmin && params.get(COMING_SOON_PREVIEW.param) === COMING_SOON_PREVIEW.value) {
    return <ComingSoonPage status={status} />;
  }

  return (
    <>
      <Outlet />
      {!isError && !status.isPublished && <PreviewPill />}
    </>
  );
}
