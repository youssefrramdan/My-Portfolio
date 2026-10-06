import { Eye } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ProjectStandalone from '@/features/projects/ProjectStandalone';
import { useWorkItem } from '../../hooks/useWork';
import { WORK_EDITOR, workEditPath } from './constants';
import { toPublicProject } from './workForm';

const COPY = WORK_EDITOR.fullPreview;

/** `/admin/preview/work/:id`: the item's working copy rendered as the real project page (admin only). */
export default function WorkPreviewPage() {
  const { id } = useParams();
  const { data, isPending, isError } = useWorkItem(id);

  return (
    <ProjectStandalone
      project={data ? toPublicProject(data.work) : undefined}
      isPending={isPending}
      isError={isError}
      banner={
        <div
          role="note"
          className="fixed top-24 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-full border border-border-primary bg-bg-primary/82 py-2 pr-2 pl-4 text-small whitespace-nowrap text-text-secondary backdrop-blur-lg"
        >
          <Eye aria-hidden className="size-4 shrink-0 text-text-brand" />
          <span className="truncate">
            <span className="font-medium text-text-primary">{COPY.banner}</span>
            <span className="max-tablet:hidden"> · {COPY.note}</span>
          </span>
          <Link
            to={workEditPath(id)}
            className="shrink-0 rounded-full bg-neutral-surface-2 px-3 py-1 text-extra-small text-text-primary outline-none hover:bg-card-primary focus-visible:ring-2 focus-visible:ring-fill-primary"
          >
            {COPY.back}
          </Link>
        </div>
      }
    />
  );
}
