import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { adminButton } from '../../components/buttonStyles';
import ErrorState from '../../components/ErrorState';
import Skeleton from '../../components/Skeleton';
import { useAutosave } from '../../hooks/useAutosave';
import { usePublishWork, useSaveWorkDraft, useWorkItem } from '../../hooks/useWork';
import { WORK_EDITOR as COPY, WORK_PATH } from './constants';
import DeleteCard from './DeleteCard';
import EditorHeader from './EditorHeader';
import GalleryCard from './GalleryCard';
import PreviewCard from './PreviewCard';
import RequiredDetailsCard from './RequiredDetailsCard';
import StatusCard from './StatusCard';
import WorkDetailsCard from './WorkDetailsCard';
import { toForm, toPayload, workSchema } from './workForm';

/**
 * `/admin/content/work/:id` (Figma 538:9228): one Work item. Edits autosave to the item's draft; the site changes
 * only when it is published. The right column previews the project page and the home card.
 */
export default function WorkEditorPage() {
  const { id } = useParams();
  const { data, isPending, isError, error, isFetching, refetch } = useWorkItem(id);

  if (isPending) return <EditorSkeleton />;
  if (isError) {
    const missing = error?.status === 404 || error?.status === 400;
    return (
      <div className="flex flex-col gap-5">
        <Link to={WORK_PATH} className={adminButton({ variant: 'raised', size: 'sm', className: 'self-start' })}>
          <ArrowLeft aria-hidden className="size-4.5" />
          {COPY.back}
        </Link>
        <ErrorState
          title={missing ? COPY.notFound.title : COPY.error.title}
          message={missing ? COPY.notFound.message : COPY.error.message}
          retryLabel={COPY.error.retry}
          onRetry={missing ? undefined : () => refetch()}
          retrying={isFetching}
        />
      </div>
    );
  }
  return <WorkEditor key={id} item={data} />;
}

function WorkEditor({ item }) {
  const form = useForm({ defaultValues: toForm(item.work), resolver: zodResolver(workSchema), mode: 'onChange' });
  const { mutateAsync } = useSaveWorkDraft(item._id);
  const autosave = useAutosave({
    form,
    schema: workSchema,
    toPayload,
    save: mutateAsync,
    leaveWarning: COPY.save.leaveWarning,
  });
  const publish = usePublishWork(item._id);
  const { markSaved } = autosave;
  const { reset, setError } = form;

  const runPublish = () =>
    publish.mutate(undefined, {
      onError: (error) => {
        if (!Array.isArray(error?.data)) return;
        error.data.forEach((problem) => setError(problem.field, { type: 'publish', message: problem.message }));
      },
    });

  const resetTo = useCallback(
    (work) => {
      const values = toForm(work);
      markSaved(values);
      reset(values);
    },
    [markSaved, reset],
  );

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
        <EditorHeader item={item} saveStatus={autosave.status} onRetry={autosave.retry} publish={publish} onPublish={runPublish} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-5 xl:self-start">
            <RequiredDetailsCard index={1} />
            <WorkDetailsCard index={2} />
            <GalleryCard index={3} />
          </div>
          {/* The column spans the editor's height so the preview can stay pinned while the form scrolls. */}
          <aside className="flex min-w-0 flex-col gap-5">
            <StatusCard index={1} item={item} publish={publish} onDiscarded={resetTo} />
            <DeleteCard index={2} item={item} />
            <div className="rounded-card bg-neutral-surface-0 p-5">
              <p className="text-extra-small font-semi-bold text-neutral-text-heading">{COPY.hint.title}</p>
              <p className="mt-1 text-extra-small text-neutral-text-label">{COPY.hint.text}</p>
            </div>
            <PreviewCard index={3} item={item} control={form.control} className="xl:sticky xl:top-26 xl:max-h-[calc(100dvh-8rem)]" />
          </aside>
        </div>
      </form>
    </FormProvider>
  );
}

function EditorSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-5">
      <Skeleton className="h-19 rounded-lg" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-120 rounded-card" />
          <Skeleton className="h-100 rounded-card" />
        </div>
        <Skeleton className="h-150 rounded-card" />
      </div>
    </div>
  );
}
