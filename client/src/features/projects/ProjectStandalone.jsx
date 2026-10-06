import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import Contact from '@/features/contact/Contact';
import { PROJECT_TEXT } from './labels';
import ProjectActions from './ProjectActions';
import ProjectDetails from './ProjectDetails';
import { ProjectDetailsSkeleton, ProjectMissing } from './ProjectStates';

const TITLE_ID = 'project-title';

/**
 * The project page on its own (direct link, refresh, new tab): navbar, the same content as the home overlay, the
 * contact section and the footer. `banner` sits above everything (the dashboard draft preview).
 */
export default function ProjectStandalone({ project, isPending, isError, banner }) {
  return (
    <>
      <Navbar links={[]} />
      {banner}
      <main className="min-h-dvh pt-36 pb-28 xl:pt-38.75">
        <div className="px-grid-margin">
          <div className="mx-auto mb-8 w-full max-w-294.25">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full text-base text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-fill-primary"
            >
              <ArrowLeft aria-hidden className="size-5" />
              {PROJECT_TEXT.backHome}
            </Link>
          </div>
        </div>
        {isPending ? (
          <ProjectDetailsSkeleton />
        ) : isError || !project ? (
          <ProjectMissing />
        ) : (
          <ProjectDetails project={project} titleId={TITLE_ID} />
        )}
      </main>
      <Contact />
      <Footer links={[]} />
      {project && <ProjectActions project={project} className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2" />}
    </>
  );
}
