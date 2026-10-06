export default function HeroSkeleton() {
  return (
    <section aria-busy="true" className="relative overflow-x-clip pt-28 pb-22 tablet:pt-27.5 tablet:pb-space-5">
      <div className="mx-auto flex w-full animate-pulse flex-col items-center gap-space-3 px-grid-margin desktop:gap-space-5">
        <div className="flex w-full max-w-241 flex-col items-center gap-space-2">
          <span className="h-9 w-40 rounded-full bg-card-primary desktop:w-46" />
          <span className="h-10 w-full max-w-180 rounded-lg bg-card-primary tablet:h-14 desktop:h-18" />
          <span className="h-10 w-4/5 max-w-150 rounded-lg bg-card-primary tablet:h-14 desktop:h-18" />
          <span className="mt-space-2 h-4 w-full max-w-200 rounded-full bg-card-primary" />
          <span className="h-4 w-11/12 max-w-180 rounded-full bg-card-primary" />
          <span className="h-4 w-3/4 max-w-120 rounded-full bg-card-primary" />
          <div className="mt-space-3 flex w-full flex-col items-center gap-3 tablet:flex-row tablet:justify-center tablet:gap-space-2">
            <span className="h-12 w-full rounded-full bg-card-primary tablet:w-44" />
            <span className="h-12 w-full rounded-full bg-card-primary tablet:w-40" />
          </div>
        </div>
        <span className="h-48 w-full max-w-221.5 rounded-xl bg-card-primary tablet:h-96 xl:h-118.5" />
      </div>
    </section>
  );
}
