import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Hammer } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { adminEnter } from '@/lib/motion';
import { adminButton } from '../../components/buttonStyles';
import { PLACEHOLDER } from '../../layout/constants';
import { ADMIN_BASE, NAV_ROUTES } from '../../layout/navigation';

/** Admin area that is not built yet (a later Phase 8 module). Not the public Coming Soon page. */
export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const name = NAV_ROUTES.find((item) => item.to === pathname.replace(/\/+$/, ''))?.label ?? '';

  return (
    <motion.section
      variants={adminEnter(reduce)}
      initial="hidden"
      animate="visible"
      aria-labelledby="placeholder-title"
      className="relative isolate mt-3 flex flex-col items-start gap-5 overflow-hidden rounded-card bg-neutral-surface-0 p-6 tablet:p-10"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 right-10 -z-10 size-42 rounded-full bg-brand-color/20 blur-3xl"
      />
      <span className="flex size-11 items-center justify-center rounded-tile bg-neutral-surface-control text-text-brand">
        <Hammer aria-hidden className="size-5" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{PLACEHOLDER.eyebrow}</p>
        <h2 id="placeholder-title" className="text-h5 font-black text-neutral-text-heading">
          {PLACEHOLDER.title(name)}
        </h2>
        <p className="max-w-127.5 text-small text-neutral-text-label">{PLACEHOLDER.description}</p>
      </div>
      <Link to={ADMIN_BASE} className={adminButton({ variant: 'secondary' })}>
        <ArrowLeft aria-hidden className="size-4.5" />
        {PLACEHOLDER.back}
      </Link>
    </motion.section>
  );
}
