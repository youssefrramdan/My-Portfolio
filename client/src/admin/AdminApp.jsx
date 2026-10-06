import { useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ADMIN_KEY, ME_KEY } from './hooks/useAuth';
import AdminLayout from './layout/AdminLayout';
import { ADMIN_BASE, LOGIN_PATH, PLACEHOLDER_PATHS, SETTINGS_PATHS } from './layout/navigation';
import { setUnauthorizedHandler } from './lib/adminApi';

const LoginPage = lazy(() => import('./pages/login/LoginPage'));
const OverviewPage = lazy(() => import('./pages/overview/OverviewPage'));
const IdentityPage = lazy(() => import('./pages/identity/IdentityPage'));
const ContentPage = lazy(() => import('./pages/content/ContentPage'));
const WorkListPage = lazy(() => import('./pages/work/WorkListPage'));
const WorkEditorPage = lazy(() => import('./pages/work/WorkEditorPage'));
const WorkPreviewPage = lazy(() => import('./pages/work/WorkPreviewPage'));
const CapabilitiesListPage = lazy(() => import('./pages/capabilities/CapabilitiesListPage'));
const CapabilityEditorPage = lazy(() => import('./pages/capabilities/CapabilityEditorPage'));
const CredentialsListPage = lazy(() => import('./pages/credentials/CredentialsListPage'));
const CredentialEditorPage = lazy(() => import('./pages/credentials/CredentialEditorPage'));
const TestimonialsListPage = lazy(() => import('./pages/testimonials/TestimonialsListPage'));
const TestimonialEditorPage = lazy(() => import('./pages/testimonials/TestimonialEditorPage'));
const ContactPage = lazy(() => import('./pages/contact/ContactPage'));
const PagePage = lazy(() => import('./pages/page/PagePage'));
const MediaPage = lazy(() => import('./pages/media/MediaPage'));
const GeneralSettingsPage = lazy(() => import('./pages/settings/GeneralPage'));
const SeoSettingsPage = lazy(() => import('./pages/settings/SeoPage'));
const ComingSoonSettingsPage = lazy(() => import('./pages/settings/ComingSoonPage'));
const AccountSettingsPage = lazy(() => import('./pages/settings/AccountPage'));
const PlaceholderPage = lazy(() => import('./pages/placeholder/PlaceholderPage'));

/** Pages inside the admin layout, relative to `/admin`. */
const PAGES = [
  { path: 'identity', Page: IdentityPage },
  { path: 'content', Page: ContentPage },
  { path: 'content/work', Page: WorkListPage },
  { path: 'content/work/:id', Page: WorkEditorPage },
  { path: 'content/capabilities', Page: CapabilitiesListPage },
  { path: 'content/capabilities/:id', Page: CapabilityEditorPage },
  { path: 'content/credentials', Page: CredentialsListPage },
  { path: 'content/credentials/:id', Page: CredentialEditorPage },
  { path: 'content/testimonials', Page: TestimonialsListPage },
  { path: 'content/testimonials/:id', Page: TestimonialEditorPage },
  { path: 'content/contact', Page: ContactPage },
  { path: 'media', Page: MediaPage },
  { path: 'page', Page: PagePage },
  { path: 'settings/general', Page: GeneralSettingsPage },
  { path: 'settings/seo', Page: SeoSettingsPage },
  { path: 'settings/coming-soon', Page: ComingSoonSettingsPage },
  { path: 'settings/account', Page: AccountSettingsPage },
  ...PLACEHOLDER_PATHS.map((path) => ({ path, Page: PlaceholderPage })),
];

/** Admin routes, mounted on `/admin/*` (the whole admin is lazy-loaded, so none of it ships in the public bundle). */
export default function AdminApp() {
  useSessionExpiryRedirect();

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          path="preview/work/:id"
          element={
            <ProtectedRoute>
              <WorkPreviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={null}>
                <OverviewPage />
              </Suspense>
            }
          />
          {PAGES.map(({ path, Page }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={null}>
                  <Page />
                </Suspense>
              }
            />
          ))}
          <Route path="settings" element={<Navigate to={SETTINGS_PATHS.general} replace />} />
          <Route path="*" element={<Navigate to={ADMIN_BASE} replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

/** When an admin request returns 401 (expired cookie), clear the cached session and go to the login page. */
function useSessionExpiryRedirect() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.removeQueries({ queryKey: ADMIN_KEY });
      queryClient.setQueryData(ME_KEY, null);
      navigate(LOGIN_PATH, { replace: true, state: { from: pathname } });
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, navigate, pathname]);
}
