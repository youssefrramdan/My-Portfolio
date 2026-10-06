import { Navigate, useLocation } from 'react-router-dom';
import { useMe } from '../hooks/useAuth';
import { SESSION as TEXT } from '../layout/constants';
import { LOGIN_PATH } from '../layout/navigation';
import ErrorState from './ErrorState';
import Skeleton from './Skeleton';

/** Renders its children only for a logged-in admin; otherwise redirects to the login page. */
export default function ProtectedRoute({ children }) {
  const { data: user, isPending, isError, isFetching, refetch } = useMe();
  const location = useLocation();

  if (isPending) return <ShellSkeleton />;
  if (isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-primary p-4">
        <ErrorState
          title={TEXT.errorTitle}
          message={TEXT.errorMessage}
          retryLabel={TEXT.retry}
          onRetry={() => refetch()}
          retrying={isFetching}
          className="w-full max-w-110"
        />
      </div>
    );
  }
  if (!user) return <Navigate to={LOGIN_PATH} replace state={{ from: location.pathname }} />;
  return children;
}

function ShellSkeleton() {
  return (
    <div role="status" className="min-h-dvh bg-bg-primary">
      <span className="sr-only">{TEXT.checking}</span>
      <div className="fixed inset-y-0 left-0 hidden w-63.5 flex-col gap-3 bg-neutral-surface-section px-4 py-5 lg:flex">
        <Skeleton className="mb-6 h-10 w-36" />
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-12 rounded-md" />
        ))}
      </div>
      <div className="flex flex-col gap-5 px-4 pt-6 tablet:px-6 lg:pl-73.5 lg:pr-10">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-14 w-2/3" />
        <div className="grid gap-5 xl:grid-cols-8">
          <Skeleton className="h-96 rounded-card xl:col-span-5" />
          <Skeleton className="h-96 rounded-card xl:col-span-3" />
        </div>
      </div>
    </div>
  );
}
