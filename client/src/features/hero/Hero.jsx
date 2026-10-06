import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import CtaButton from '@/components/ui/CtaButton';
import { useSettings } from '@/features/settings/useSettings';
import { cldUrl } from '@/lib/cloudinary';
import { ctaContext } from '@/lib/cta';
import { DISTANCE, ENTRANCE, useEntrance } from '@/lib/motion';
import { SECTION } from '@/lib/sections';
import HeroHeadline from './HeroHeadline';
import HeroSkeleton from './HeroSkeleton';
import HeroStripes from './HeroStripes';
import PhotoCursor from './PhotoCursor';
import SkillTags from './SkillTags';
import StatsCards from './StatsCards';
import { useHero } from './useHero';

export default function Hero() {
  const { data: hero, isPending, isError } = useHero();
  const { data: settings } = useSettings();
  const entrance = useEntrance();

  if (isPending) return <HeroSkeleton />;
  if (isError || !hero) return null;

  const infoDelay = (step) => step * ENTRANCE.stagger;
  const { photo } = hero;
  const context = ctaContext(settings);

  return (
    <section
      id={SECTION.about}
      className="relative overflow-x-clip pt-28 pb-22 tablet:pt-27.5 tablet:pb-space-5"
    >
      <HeroStripes />

      <div className="relative mx-auto flex w-full flex-col items-center gap-space-3 px-grid-margin desktop:gap-space-5">
        <div className="flex w-full max-w-241 flex-col items-center gap-space-2">
          <motion.div {...entrance(DISTANCE.info, infoDelay(0))}>
            <Badge className="px-2 desktop:px-4">{hero.role}</Badge>
          </motion.div>

          <motion.div {...entrance(DISTANCE.info, infoDelay(1))}>
            <HeroHeadline
              title={hero.title}
              lineBreak={hero.headline?.lineBreak}
              imageSlots={hero.headline?.imageSlots}
              interval={hero.headline?.interval}
            />
          </motion.div>

          {hero.intro && (
            <motion.p
              {...entrance(DISTANCE.info, infoDelay(2))}
              className="text-center text-base whitespace-pre-line text-text-secondary desktop:text-large"
            >
              {hero.intro}
            </motion.p>
          )}

          <motion.div
            {...entrance(DISTANCE.info, infoDelay(3))}
            className="mt-space-3 flex w-full max-w-210.5 flex-col items-center gap-3 tablet:flex-row tablet:gap-space-2"
          >
            <span aria-hidden className="hidden flex-1 items-center gap-1 tablet:flex">
              <span className="h-px flex-1 bg-linear-to-l from-neutral-gray/60 to-transparent" />
              <span className="h-1 w-2 rounded-full bg-neutral-brand-white" />
            </span>
            <CtaButton
              cta={hero.ctaPrimary}
              context={context}
              variant="secondary"
              icon={<ArrowUpRight className="size-6" />}
              rotateIcon
              className="w-full tablet:w-50.75"
            />
            <CtaButton
              cta={hero.ctaSecondary}
              context={context}
              variant="primary"
              glow
              className="w-full tablet:w-50.75"
            />
            <span aria-hidden className="hidden flex-1 items-center gap-1 tablet:flex">
              <span className="h-1 w-2 rounded-full bg-neutral-brand-white" />
              <span className="h-px flex-1 bg-linear-to-r from-neutral-gray/60 to-transparent" />
            </span>
          </motion.div>
        </div>

        <div className="relative w-full max-w-221.5">
          {hero.backgroundText && (
            <motion.p
              aria-hidden
              {...entrance(DISTANCE.name)}
              className="pointer-events-none absolute top-0 left-1/2 w-screen -translate-x-1/2 text-center text-display font-black text-balance text-neutral-surface-3 select-none xl:top-11 xl:whitespace-nowrap"
            >
              {hero.backgroundText}
            </motion.p>
          )}

          {photo?.url && (
            <PhotoCursor cursor={hero.photoCursor} className="relative z-10">
              <motion.img
                {...entrance(DISTANCE.image)}
                src={cldUrl(photo.url, { width: 1772 })}
                alt={photo.alt}
                width={876}
                height={508}
                fetchPriority="high"
                className="relative block h-auto w-full"
              />
            </PhotoCursor>
          )}

          <SkillTags skills={hero.skillTags} className="-left-20 top-8 z-20 hidden xl:block" />
          <StatsCards stats={hero.stats} className="z-20" />
        </div>
      </div>
    </section>
  );
}
