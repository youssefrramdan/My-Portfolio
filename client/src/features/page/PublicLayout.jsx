import { Outlet, useLocation } from 'react-router-dom';
import AllProjectsPage from '@/features/projects/AllProjectsPage';
import HomePage from './HomePage';

/** Pages a project can open over (`state.backdrop`). */
const BACKDROPS = { '/': HomePage, '/projects': AllProjectsPage };

/**
 * Keeps the home (or the all-projects page) mounted while a project opened from one of its cards
 * (`state.backdrop`) is shown on top, so its scroll position, loaded sections and animations survive the round
 * trip. A project reached any other way renders on its own.
 */
export default function PublicLayout() {
  const { pathname, state } = useLocation();
  const page = BACKDROPS[pathname] ? pathname : state?.backdrop;
  const Page = BACKDROPS[page];

  return (
    <>
      {Page && <Page covered={page !== pathname} />}
      <Outlet />
    </>
  );
}
