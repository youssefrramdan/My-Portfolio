import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '@/features/page/PublicLayout';
import ProjectPage from '@/features/projects/ProjectPage';
import SiteGate from '@/features/site/SiteGate';

const AdminApp = lazy(() => import('@/admin/AdminApp'));

const routes = [
  {
    element: <SiteGate />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: null },
          { path: '/projects', element: null },
          { path: '/projects/:slug', element: <ProjectPage /> },
        ],
      },
    ],
  },
  {
    path: '/admin/*',
    element: (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ),
  },
];

// TODO: delete /tokens-preview (and app/dev/) once tokens are verified against Figma.
if (import.meta.env.DEV) {
  const TokensPreview = lazy(() => import('@/app/dev/TokensPreview'));
  routes.push({
    path: '/tokens-preview',
    element: (
      <Suspense fallback={null}>
        <TokensPreview />
      </Suspense>
    ),
  });

  // TODO: delete /contact-preview (and app/dev/ContactPreview.jsx) once the arc is verified for every count.
  const ContactPreview = lazy(() => import('@/app/dev/ContactPreview'));
  routes.push({
    path: '/contact-preview',
    element: (
      <Suspense fallback={null}>
        <ContactPreview />
      </Suspense>
    ),
  });
}

const router = createBrowserRouter(routes);

export default router;
