import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { Unlink } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { adminEnter } from '@/lib/motion';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorState from '../../components/ErrorState';
import Skeleton from '../../components/Skeleton';
import { useIdentity } from '../../hooks/useIdentity';
import BasicInfoCard from './BasicInfoCard';
import { IDENTITY } from './constants';
import ContentTabs from './ContentTabs';
import { identitySchema, toForm } from './identityForm';
import LivePreview from './LivePreview';
import ResumeCard from './ResumeCard';
import SaveBar from './SaveBar';
import { useIdentityAutosave, useOrphanGuard } from './useIdentityAutosave';
import VisualsCard from './VisualsCard';

/**
 * Identity (Figma 538:8099 / 546:12416): everything the hero, navbar and footer say about you. Edits autosave to
 * a draft; the public site changes only when the draft is published from the preview card.
 */
export default function IdentityPage() {
  const { data, isPending, isError, isFetching, refetch } = useIdentity();
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col">
      <motion.div variants={adminEnter(reduce)} initial="hidden" animate="visible" className="flex flex-col gap-2">
        <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{IDENTITY.eyebrow}</p>
        <h2 className="text-h4 font-black tracking-tight text-neutral-text-heading">{IDENTITY.title}</h2>
        <p className="text-small text-neutral-text-label">{IDENTITY.subtitle}</p>
      </motion.div>

      {isPending ? (
        <IdentitySkeleton />
      ) : isError ? (
        <ErrorState
          title={IDENTITY.error.title}
          message={IDENTITY.error.message}
          retryLabel={IDENTITY.error.retry}
          onRetry={() => refetch()}
          retrying={isFetching}
          className="mt-7"
        />
      ) : (
        <IdentityEditor state={data} />
      )}
    </div>
  );
}

function IdentityEditor({ state }) {
  const form = useForm({ defaultValues: toForm(state.identity), resolver: zodResolver(identitySchema), mode: 'onChange' });
  const autosave = useIdentityAutosave(form);
  const orphans = useOrphanGuard(form);

  const handleDiscarded = (identity) => {
    const values = toForm(identity);
    autosave.markSaved(values);
    form.reset(values);
  };

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={(event) => event.preventDefault()}>
        <SaveBar status={autosave.status} onRetry={autosave.retry} control={form.control} />

        <div className="mt-5 grid items-start gap-5 xl:grid-cols-10">
          <div className="flex min-w-0 flex-col gap-5 xl:col-span-7">
            <BasicInfoCard index={2} />
            <ContentTabs index={3} state={state} onTitleBlur={orphans.check} />
            <VisualsCard index={4} />
            <ResumeCard index={5} />
          </div>
          <aside className="scrollbar-soft min-w-0 rounded-card xl:sticky xl:top-26 xl:col-span-3 xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto">
            <LivePreview
              index={2}
              control={form.control}
              state={state}
              saveStatus={autosave.status}
              onDiscarded={handleDiscarded}
            />
          </aside>
        </div>
      </form>

      <OrphanDialog pending={orphans.pending} onConfirm={orphans.confirm} onCancel={orphans.cancel} />
    </FormProvider>
  );
}

/** Title edits that remove an anchored word are confirmed here; cancelling restores the previous title. */
function OrphanDialog({ pending, onConfirm, onCancel }) {
  const copy = IDENTITY.orphans;
  return (
    <ConfirmDialog
      open={Boolean(pending)}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={copy.title}
      description={copy.description}
      confirmLabel={copy.confirm}
      cancelLabel={copy.cancel}
      tone="danger"
      icon={Unlink}
    >
      {pending && (
        <ul className="flex flex-col gap-2">
          {pending.slots.map((slot) => (
            <li key={`${slot.word}-${slot.occurrence}`} className="rounded-md bg-neutral-surface-raised px-4 py-3 text-small text-text-primary">
              {copy.slot(slot.word, slot.images.length)}
            </li>
          ))}
          {pending.lineBreak && (
            <li className="rounded-md bg-neutral-surface-raised px-4 py-3 text-small text-text-primary">
              {pending.breakIsLast ? copy.lineBreakLast : copy.lineBreak(pending.lineBreakWord)}
            </li>
          )}
        </ul>
      )}
    </ConfirmDialog>
  );
}

function IdentitySkeleton() {
  return (
    <div role="status" className="mt-7 flex flex-col gap-5">
      <Skeleton className="h-18 rounded-tile" />
      <div className="grid gap-5 xl:grid-cols-10">
        <div className="flex flex-col gap-5 xl:col-span-7">
          <Skeleton className="h-60 rounded-card" />
          <Skeleton className="h-150 rounded-card" />
        </div>
        <Skeleton className="h-150 rounded-card xl:col-span-3" />
      </div>
    </div>
  );
}
