import { useLocation, useParams } from 'react-router-dom';
import ProjectOverlay from './ProjectOverlay';
import ProjectStandalone from './ProjectStandalone';
import { useProject } from './useProjects';

/**
 * `/projects/:slug`. Opened from a card (`state.backdrop`), the project slides over the page it was opened from
 * like a Behance project; a direct link gets the standalone page with the same content.
 */
export default function ProjectPage() {
  const { slug } = useParams();
  const { state } = useLocation();
  const query = useProject(slug);

  if (state?.backdrop) return <ProjectOverlay key={slug} query={query} />;
  return <ProjectStandalone project={query.data} isPending={query.isPending} isError={query.isError} />;
}
