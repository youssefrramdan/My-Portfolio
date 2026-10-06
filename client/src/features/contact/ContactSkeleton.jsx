export default function ContactSkeleton() {
  return (
    <section aria-busy="true" className="px-grid-margin py-12 xl:pt-6.5 xl:pb-20">
      <div className="flex animate-pulse flex-col items-center">
        <span className="h-9 w-40 rounded-full bg-card-primary" />
        <span className="mt-2 h-20 w-64 rounded-lg bg-card-primary tablet:h-28 tablet:w-80 desktop:h-36 desktop:w-100" />
        <span className="mt-4 h-4 w-full max-w-200 rounded-full bg-card-primary" />
        <span className="mt-2 h-4 w-3/4 max-w-150 rounded-full bg-card-primary" />
        <div className="mt-8 flex w-full max-w-210.5 justify-center gap-2 tablet:gap-2.5">
          <span className="h-12 grow basis-40 rounded-full bg-card-primary tablet:w-50.75 tablet:grow-0 tablet:basis-auto" />
          <span className="h-12 grow basis-40 rounded-full bg-card-primary tablet:w-50.75 tablet:grow-0 tablet:basis-auto" />
        </div>
        <div className="mt-8 flex gap-2 xl:hidden">
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className="size-9 rounded-full bg-card-primary" />
          ))}
        </div>
      </div>
    </section>
  );
}
