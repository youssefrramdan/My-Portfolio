export default function ProjectsSkeleton() {
  return (
    <section aria-busy="true" className="overflow-hidden bg-bg-primary py-space-5">
      <div className="flex animate-pulse flex-col gap-space-5">
        <div className="flex flex-col gap-4 px-grid-margin tablet:items-center">
          <span className="h-9 w-40 rounded-full bg-card-primary" />
          <span className="h-10 w-64 rounded-lg bg-card-primary tablet:h-14 tablet:w-96 desktop:h-18 desktop:w-130" />
          <span className="h-12 w-full max-w-152.5 rounded-lg bg-card-primary" />
          <span className="h-12 w-48 rounded-full bg-card-primary" />
        </div>
        <div className="flex gap-4 px-grid-margin">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="h-72 w-80 shrink-0 rounded-xl bg-card-primary tablet:h-88 tablet:w-96 xl:h-104 xl:w-116" />
          ))}
        </div>
      </div>
    </section>
  );
}
