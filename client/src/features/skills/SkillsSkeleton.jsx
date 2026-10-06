export default function SkillsSkeleton() {
  return (
    <section aria-busy="true" className="bg-neutral-surface-section py-space-5 desktop:pt-space-4 xl:pb-13">
      <div className="flex animate-pulse flex-col gap-space-5">
        <div className="flex flex-col items-center gap-4 px-grid-margin tablet:items-start">
          <span className="h-9 w-32 rounded-full bg-card-primary" />
          <span className="h-10 w-64 rounded-lg bg-card-primary tablet:h-12 tablet:w-80 desktop:h-16 desktop:w-124" />
        </div>
        <div className="flex flex-col gap-4 px-grid-margin tablet:flex-row tablet:flex-wrap tablet:justify-center tablet:gap-x-space-4 tablet:gap-y-space-5 xl:flex-nowrap xl:gap-5.5 xl:px-0">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="h-56 rounded-card bg-card-primary tablet:h-71 tablet:w-72.25" />
          ))}
        </div>
      </div>
    </section>
  );
}
