import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CARD_CLASS } from './card';
import { GRADUATED_LABEL } from './labels';

export default function GraduationCard({ education, className, ...motionProps }) {
  return (
    <motion.article className={cn(CARD_CLASS, 'flex flex-col gap-space-4 desktop:gap-8.75', className)} {...motionProps}>
      <p className="text-large text-text-secondary">{GRADUATED_LABEL}</p>
      <p className="text-center text-year font-black text-text-brand">{education.graduationYear}</p>
      <p className="text-large text-text-secondary">{education.graduationDescription}</p>
    </motion.article>
  );
}
