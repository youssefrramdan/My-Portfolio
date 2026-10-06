import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminButton } from '../buttonStyles';
import ErrorState from '../ErrorState';
import Skeleton from '../Skeleton';

/** Two-column editor grid: form on the left, status / delete / hint on the right (xl+). */
export const EDITOR_GRID = 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]';

/**
 * Loading / not found / error states of a content editor page. `query` is the module's item query; `children(item)`
 * renders the editor once the item is loaded (keyed by id so switching items starts a fresh form).
 */
export default function ContentEditorFrame({ id, query, backTo, copy, children }) {
  const { data, isPending, isError, error, isFetching, refetch } = query;

  if (isPending) return <EditorSkeleton />;
  if (isError) {
    const missing = error?.status === 404 || error?.status === 400;
    return (
      <div className="flex flex-col gap-5">
        <Link to={backTo} className={adminButton({ variant: 'raised', size: 'sm', className: 'self-start' })}>
          <ArrowLeft aria-hidden className="size-4.5" />
          {copy.back}
        </Link>
        <ErrorState
          title={missing ? copy.notFound.title : copy.error.title}
          message={missing ? copy.notFound.message : copy.error.message}
          retryLabel={copy.error.retry}
          onRetry={missing ? undefined : () => refetch()}
          retrying={isFetching}
        />
      </div>
    );
  }
  return <div key={id}>{children(data)}</div>;
}

function EditorSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-5">
      <Skeleton className="h-19 rounded-lg" />
      <div className={EDITOR_GRID}>
        <Skeleton className="h-100 rounded-card" />
        <Skeleton className="h-80 rounded-card" />
      </div>
    </div>
  );
}
