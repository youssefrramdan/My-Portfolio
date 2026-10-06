export default function EducationSkeleton() {
  return (
    <section aria-busy="true" className="bg-bg-primary pt-space-5 pb-space-5">
      <div className="mx-auto flex w-full max-w-360 animate-pulse flex-col gap-space-5 px-grid-margin">
        <div className="flex flex-col items-center gap-4">
          <span className="h-9 w-36 rounded-full bg-card-primary" />
          <span className="h-10 w-64 rounded-lg bg-card-primary tablet:h-12 tablet:w-96 desktop:h-16 desktop:w-150" />
        </div>
        <div className="flex flex-col gap-space-3">
          <div className="flex flex-col gap-space-3 xl:flex-row">
            <span className="h-80 rounded-card bg-card-primary xl:h-91.5 xl:basis-2/3" />
            <span className="h-64 rounded-card bg-card-primary xl:h-91.5 xl:basis-1/3" />
          </div>
          <span className="h-96 rounded-card bg-card-primary xl:h-106" />
        </div>
      </div>
    </section>
  );
}
