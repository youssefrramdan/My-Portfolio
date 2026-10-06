import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CARD_CLASS } from './card';
import CertificateRow from './CertificateRow';

/** `rowVariants` (with the row index as `custom`) stagger the rows in after the card itself. */
export default function CertificatesCard({ title, certificates, rowVariants, className, ...motionProps }) {
  return (
    <motion.article
      aria-labelledby={title ? 'certificates-title' : undefined}
      className={cn(CARD_CLASS, 'flex flex-col gap-space-3', className)}
      {...motionProps}
    >
      {title && (
        <h3 id="certificates-title" className="text-large text-text-secondary">
          {title}
        </h3>
      )}
      <ol className="flex flex-col">
        {certificates.map((certificate, index) => (
          <CertificateRow
            key={certificate._id}
            certificate={certificate}
            number={index + 1}
            variants={rowVariants}
            custom={index}
          />
        ))}
      </ol>
    </motion.article>
  );
}
