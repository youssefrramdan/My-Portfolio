import SectionTitle from '@/components/ui/SectionTitle';
import { PROJECT_TEXT } from './labels';

/** Title, summary and first image placeholders while a project loads. */
export function ProjectDetailsSkeleton() {
  return (
    <div role="status" className="px-grid-margin">
      <span className="sr-only">{PROJECT_TEXT.loading}</span>
      <div aria-hidden className="mx-auto flex w-full max-w-294.25 animate-pulse flex-col gap-4">
        <span className="h-10 w-3/4 max-w-174 rounded-lg bg-card-primary xl:h-16" />
        <span className="h-6 w-full max-w-270 rounded-lg bg-card-primary" />
        <span className="h-6 w-2/3 rounded-lg bg-card-primary" />
        <span className="mt-8 aspect-video w-full bg-card-primary" />
      </div>
    </div>
  );
}

/** Unknown or unpublished project. */
export function ProjectMissing() {
  return (
    <div className="flex flex-col items-center gap-space-3 px-grid-margin py-20 text-center">
      <SectionTitle as="h1" plain={PROJECT_TEXT.notFound} />
      <p className="text-large text-text-secondary">{PROJECT_TEXT.notFoundText}</p>
    </div>
  );
}
