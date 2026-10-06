import { motion, useReducedMotion } from 'framer-motion';
import { Mail } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import CtaButton from '@/components/ui/CtaButton';
import SectionTitle from '@/components/ui/SectionTitle';
import { cldUrl } from '@/lib/cloudinary';
import { COMING_SOON, EASE, IDLE_EASE, revealFrom } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { SITE_STATUS_TEXT } from './labels';

/**
 * Shown to visitors while the site is unpublished. Everything comes from `/api/site-status`.
 * Phones / tablets: one centered column with the round image on top. From `xl`: text on the left, image on the
 * right with the description under it. Without an image the text stays centered and the description follows it.
 */
export default function ComingSoonPage({ status }) {
  const reduce = useReducedMotion();
  const { comingSoon, contactEmail, backgroundName } = status;
  const image = comingSoon?.image?.url ? comingSoon.image : null;
  const description = comingSoon?.description;
  const emailCta = comingSoon?.showEmail && contactEmail
    ? { label: SITE_STATUS_TEXT.sendEmail, action: 'email', target: contactEmail }
    : null;

  const item = revealFrom({ y: COMING_SOON.rise }, reduce, { delay: COMING_SOON.delay, stagger: COMING_SOON.stagger });
  const motionProps = (index) => ({ variants: item, custom: index, initial: 'hidden', animate: 'visible' });

  return (
    <main className="relative isolate flex min-h-dvh items-center overflow-hidden bg-bg-primary">
      {backgroundName && (
        <p
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -z-20 w-screen -translate-1/2 text-center text-display font-black text-balance text-neutral-surface-3 select-none xl:whitespace-nowrap"
        >
          {backgroundName}
        </p>
      )}

      <div
        className={cn(
          'mx-auto grid w-full max-w-360 items-center gap-space-4 px-grid-margin py-space-5',
          image && 'xl:grid-cols-2',
        )}
      >
        <div
          className={cn(
            'order-2 flex flex-col items-center gap-space-2 text-center',
            image && 'xl:order-1 xl:items-start xl:text-left',
          )}
        >
          {comingSoon?.badge && (
            <motion.div {...motionProps(0)}>
              <Badge>{comingSoon.badge}</Badge>
            </motion.div>
          )}
          <motion.div {...motionProps(1)}>
            <SectionTitle
              as="h1"
              plain={comingSoon?.title?.plain}
              highlight={comingSoon?.title?.highlight}
              stacked
              className="font-black"
            />
          </motion.div>
          {comingSoon?.message && (
            <motion.p {...motionProps(2)} className="max-w-130 text-base text-text-secondary desktop:text-large">
              {comingSoon.message}
            </motion.p>
          )}
          {!image && description && <Description {...motionProps(3)}>{description}</Description>}
          {emailCta && (
            <motion.div {...motionProps(4)} className="mt-space-2">
              <CtaButton cta={emailCta} variant="primary" glow icon={<Mail className="size-5" />} />
            </motion.div>
          )}
        </div>

        {image && (
          <figure className="order-1 flex flex-col items-center gap-space-3 xl:order-2">
            <SpinningImage image={image} reduce={reduce} />
            {description && <Description {...motionProps(3)}>{description}</Description>}
          </figure>
        )}
      </div>
    </main>
  );
}

function Description({ children, ...props }) {
  return (
    <motion.p {...props} className="max-w-100 text-center text-extra-small tracking-widest text-text-secondary uppercase tablet:text-small">
      {children}
    </motion.p>
  );
}

/** Round image with a thin green ring and glow, turning slowly; a faint dashed ring turns the other way. */
function SpinningImage({ image, reduce }) {
  const spin = (turn, duration) =>
    reduce ? {} : { animate: { rotate: turn }, transition: { duration, ease: 'linear', repeat: Infinity } };

  return (
    <motion.div
      initial={{ opacity: 0, scale: reduce ? 1 : COMING_SOON.imageFrom }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: COMING_SOON.imageDuration, ease: EASE, delay: COMING_SOON.delay }}
      className="relative size-50 tablet:size-65 xl:size-105"
    >
      <motion.span
        aria-hidden
        animate={reduce ? undefined : { y: [0, -COMING_SOON.float, 0] }}
        transition={{ duration: COMING_SOON.floatDuration, ease: IDLE_EASE, repeat: Infinity }}
        className="absolute -inset-16 -z-10 rounded-full bg-brand-color/20 blur-3xl"
      />
      <motion.span
        aria-hidden
        {...spin(-360, COMING_SOON.ringSpin)}
        className="absolute -inset-4 rounded-full border border-dashed border-brand-color/25 tablet:-inset-6"
      />
      <div className="relative size-full overflow-hidden rounded-full bg-card-primary shadow-2xl ring-2 shadow-brand-color/20 ring-brand-color/60">
        <motion.img
          {...spin(360, COMING_SOON.spin)}
          src={cldUrl(image.url, { width: COMING_SOON.imageWidth })}
          alt={image.alt}
          width={420}
          height={420}
          className="size-full object-cover"
        />
      </div>
    </motion.div>
  );
}
