import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { EASE, ODOMETER } from '@/lib/motion';

function DigitReel({ digit, start, delay }) {
  const cells = [
    ...Array.from({ length: 10 * ODOMETER.spins }, (_, i) => i % 10),
    ...Array.from({ length: digit + 1 }, (_, i) => i),
  ];
  const target = `${(-(cells.length - 1) / cells.length) * 100}%`;

  return (
    <span className="relative inline-block overflow-hidden">
      <span className="invisible">{digit}</span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={{ y: '0%' }}
        animate={{ y: start ? target : '0%' }}
        transition={{ duration: ODOMETER.duration, ease: EASE, delay }}
      >
        {cells.map((cell, index) => (
          <span key={index}>{cell}</span>
        ))}
      </motion.span>
    </span>
  );
}

/** Odometer: every digit spins on its own reel and lands on the value once the number is in view. */
export default function AnimatedNumber({ value, delay = 0, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const digits = String(Math.round(value)).split('').map(Number);

  return (
    <span ref={ref} className={className} aria-label={String(value)} role="img">
      {reduce ? (
        <span aria-hidden>{value}</span>
      ) : (
        <span aria-hidden className="inline-flex tabular-nums">
          {digits.map((digit, index) => (
            <DigitReel
              key={index}
              digit={digit}
              start={inView}
              delay={delay + index * ODOMETER.digitStagger}
            />
          ))}
        </span>
      )}
    </span>
  );
}
