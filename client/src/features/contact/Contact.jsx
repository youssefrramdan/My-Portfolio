import { animate, motion, useInView, useMotionValue, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import Badge from '@/components/ui/Badge';
import CtaButton from '@/components/ui/CtaButton';
import SectionTitle from '@/components/ui/SectionTitle';
import { useSettings } from '@/features/settings/useSettings';
import { ctaContext as toCtaContext, ctaLink } from '@/lib/cta';
import { CONTACT_MOTION, EASE, REVEAL, useReveal } from '@/lib/motion';
import { SECTION } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { getArcPositions, LARGE_ARC, SMALL_ARC } from './arcLayout';
import ContactSkeleton from './ContactSkeleton';
import { ArcIcons, ArcLines, SocialRow } from './SocialArc';
import { SOCIAL_PLATFORMS } from './socialPlatforms';
import { useContact } from './useContact';

const TITLE_ID = 'contact-title';
const BUTTON_WIDTH = 'grow basis-40 tablet:w-50.75 tablet:grow-0 tablet:basis-auto';
/** Stagger order of the rising texts; the lines extend with the buttons. */
const ORDER = { badge: 0, title: 1, description: 2, buttons: 3 };

/** Line that grows outward from the center side (`origin`) once the section is visible. Reduced motion: fade. */
function ExtendingLine({ origin, delay, reduce, className }) {
  const variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, scaleX: 0 },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: { duration: CONTACT_MOTION.lineExtend, ease: EASE, delay },
    },
  };
  return (
    <motion.span
      variants={variants}
      className={cn(
        'h-px flex-1 from-neutral-brand-white to-transparent',
        origin === 'right' ? 'origin-right bg-linear-to-l' : 'origin-left bg-linear-to-r',
        className,
      )}
    />
  );
}

/** Green pill with a white center (Figma green rect + white "linear dodge" rect); fades in with its lines. */
function Notch({ delay, className }) {
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: CONTACT_MOTION.lineExtend, ease: EASE, delay } },
  };
  return (
    <motion.span
      variants={variants}
      className={cn('h-0.5 rounded-full bg-linear-to-r from-fill-primary via-neutral-brand-white to-fill-primary', className)}
    />
  );
}

/** Line + pill beside the buttons (Figma "Divider Container"); `side` = which side of the buttons. */
function SideLine({ side, reduce }) {
  const delay = ORDER.buttons * REVEAL.stagger;
  const line = <ExtendingLine origin={side === 'left' ? 'right' : 'left'} delay={delay} reduce={reduce} />;
  return (
    <span aria-hidden className="hidden flex-1 items-center gap-1 tablet:flex">
      {side === 'left' && line}
      <Notch delay={delay} className="w-2" />
      {side === 'right' && line}
    </span>
  );
}

function ContactSection({ section, socials, ctaContext, sectionId, titleId }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: REVEAL.amount });
  const reduce = useReducedMotion();
  const reveal = useReveal();
  const progress = useMotionValue(reduce ? 1 : 0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      progress.set(1);
      return undefined;
    }
    const controls = animate(progress, 1, {
      duration: CONTACT_MOTION.draw,
      delay: CONTACT_MOTION.delay,
      ease: CONTACT_MOTION.ease,
    });
    return () => controls.stop();
  }, [inView, reduce, progress]);

  const rise = reveal({ y: REVEAL.rise });
  const hasSocials = socials.length > 0;
  const positions = getArcPositions(socials.length);
  // The row follows the arc: left side bottom to top, then right side top to bottom.
  const rowOrder = socials
    .map((social, index) => ({ social, angle: positions[index].angle }))
    .sort((a, b) => a.angle - b.angle)
    .map(({ social }) => social);
  const arcProps = { progress, reduce };

  return (
    <motion.section
      ref={ref}
      id={sectionId}
      aria-labelledby={titleId}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="relative overflow-clip px-grid-margin py-12 xl:pt-0 xl:pb-20"
    >
      {hasSocials && (
        <>
          <ArcLines arc={LARGE_ARC} {...arcProps} className="hidden xl:block" />
          <ArcIcons socials={socials} {...arcProps} className="z-20 hidden xl:block" />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        <span aria-hidden className="hidden w-full max-w-210.5 items-center xl:flex">
          <ExtendingLine origin="right" delay={0} reduce={reduce} />
          <Notch delay={0} className="w-8" />
          <ExtendingLine origin="left" delay={0} reduce={reduce} />
        </span>

        {section.badge && (
          <motion.div variants={rise} custom={ORDER.badge} className="xl:mt-6">
            <Badge className="text-base">{section.badge}</Badge>
          </motion.div>
        )}

        <motion.div variants={rise} custom={ORDER.title} className="mt-2">
          <SectionTitle
            id={titleId}
            plain={section.title.plain}
            highlight={section.title.highlight}
            stacked
            className="text-h1 font-black"
          />
        </motion.div>

        {section.description && (
          <motion.p
            variants={rise}
            custom={ORDER.description}
            className="mt-4 max-w-241 text-large whitespace-pre-line text-text-secondary"
          >
            {section.description}
          </motion.p>
        )}

        <div className="relative mt-8 flex w-full flex-col items-center gap-8">
          {hasSocials && <ArcLines arc={SMALL_ARC} {...arcProps} className="xl:hidden" />}

          <div className="relative flex w-full max-w-210.5 flex-wrap items-center justify-center gap-2 tablet:flex-nowrap tablet:gap-2.5">
            <SideLine side="left" reduce={reduce} />
            {ctaLink(section.primaryCta, ctaContext) && (
              <motion.div variants={rise} custom={ORDER.buttons} className={cn('flex', BUTTON_WIDTH)}>
                <CtaButton
                  cta={section.primaryCta}
                  context={ctaContext}
                  variant="secondary"
                  icon={<ArrowUpRight className="size-6" />}
                  rotateIcon
                  className="w-full"
                />
              </motion.div>
            )}
            {ctaLink(section.secondaryCta, ctaContext) && (
              <motion.div variants={rise} custom={ORDER.buttons} className={cn('flex', BUTTON_WIDTH)}>
                <CtaButton cta={section.secondaryCta} context={ctaContext} variant="primary" glow className="w-full" />
              </motion.div>
            )}
            <SideLine side="right" reduce={reduce} />
          </div>

          {hasSocials && <SocialRow socials={rowOrder} {...arcProps} className="xl:hidden" />}
        </div>
      </div>
    </motion.section>
  );
}

/**
 * Contact section (Figma 184:20913 desktop, 403:12558 mobile). Texts and buttons come from `/api/contact`,
 * socials from settings. From xl the icons sit on a large arc around the text; below xl they form a row
 * under the buttons with a small arc behind. No socials: text and buttons only. No section: nothing.
 * `socials` overrides the settings list (dev preview only). `sectionId` / `titleId` change the ids when a second
 * copy is on the page (the project overlay over the home).
 */
export default function Contact({ socials: socialsOverride, sectionId = SECTION.contact, titleId = TITLE_ID }) {
  const { data, isPending, isError } = useContact();
  const { data: settings } = useSettings();

  if (isPending) return <ContactSkeleton />;
  if (isError || !data?.section) return null;

  const socials = (socialsOverride ?? settings?.socials ?? []).filter((social) => SOCIAL_PLATFORMS[social.platform]);
  return (
    <ContactSection
      section={data.section}
      socials={socials}
      ctaContext={toCtaContext(settings)}
      sectionId={sectionId}
      titleId={titleId}
    />
  );
}
