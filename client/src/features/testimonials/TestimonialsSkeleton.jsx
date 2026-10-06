export default function TestimonialsSkeleton() {
  return (
    <section aria-busy="true" className="overflow-clip bg-neutral-surface-section py-space-5 desktop:py-space-4">
      <div className="flex animate-pulse flex-col gap-space-5">
        <div className="mx-auto flex w-full max-w-360 flex-col items-start gap-4 px-grid-margin">
          <span className="h-9 w-36 rounded-full bg-card-primary" />
          <span className="h-10 w-64 rounded-lg bg-card-primary tablet:h-12 tablet:w-96 desktop:h-16 desktop:w-128" />
        </div>
        <div className="flex gap-space-2 px-grid-margin tablet:gap-space-3">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="h-96.5 w-75 shrink-0 rounded-card bg-card-primary tablet:h-103 tablet:w-104" />
          ))}
        </div>
        <div className="flex flex-col items-center gap-6 px-grid-margin">
          <span className="h-6 w-64 rounded-lg bg-card-primary desktop:h-8 desktop:w-80" />
          <span className="h-12 w-56 rounded-full bg-card-primary" />
        </div>
      </div>
    </section>
  );
}
