import { motion, useMotionValue } from 'framer-motion';
import { useId, useState } from 'react';
import { cursorColor, isLightColor, PHOTO_CURSOR } from '@shared/identity';
import { cn } from '@/lib/utils';

/** Figma 651:16808: the arrow is drawn pointing up, then turned so its tip (12.64, 2.22) sits on the mouse. */
const ARROW_TRANSFORM = { transformOrigin: '12.64px 2.22px', transform: 'translate(-12.64px, -2.22px) rotate(-45deg) scale(0.8)' };

/**
 * Figma-style multiplayer cursor: over `children` (the hero photo) the mouse becomes an arrow with a name tag that
 * follows it. Colors come from Identity; the tag text turns dark or light to stay readable. Touch input and an empty
 * label leave the photo as it is.
 */
export default function PhotoCursor({ cursor, className, children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [shown, setShown] = useState(false);
  const shadowId = `cursor-shadow-${useId().replace(/[^\w-]/g, '')}`;
  const label = cursor?.label?.trim();

  if (!label) return <div className={className}>{children}</div>;

  const color = cursorColor(cursor.color, PHOTO_CURSOR.color);
  const background = cursorColor(cursor.background, PHOTO_CURSOR.background);

  const move = (event) => {
    if (event.pointerType !== 'mouse') return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - box.left);
    y.set(event.clientY - box.top);
    setShown(true);
  };

  return (
    <div className={cn('relative', shown && 'cursor-none', className)} onPointerMove={move} onPointerLeave={() => setShown(false)}>
      {children}
      <motion.div
        aria-hidden
        style={{ x, y }}
        initial={false}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ duration: 0.12 }}
        className="pointer-events-none absolute top-0 left-0 z-30"
      >
        <svg
          width="25.284"
          height="27.6112"
          viewBox="0 0 25.284 27.6112"
          fill="none"
          style={ARROW_TRANSFORM}
          className="absolute top-0 left-0 overflow-visible"
        >
          <g filter={`url(#${shadowId})`}>
            <path d="M3.89292 22.845L12.642 3.43362L21.3911 22.845L12.642 19.6098L3.89292 22.845Z" fill={color} />
            <path
              d="M13.098 3.22854L21.847 22.6397L22.3373 23.7285L21.2181 23.3135L12.6419 20.1426L4.06674 23.3135L2.94663 23.7285L3.43686 22.6397L12.1859 3.22854L12.6419 2.21682L13.098 3.22854Z"
              stroke="#F5FAFF"
            />
          </g>
          <defs>
            <filter id={shadowId} x="0" y="0" width="25.284" height="27.6112" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="shadow" />
              <feBlend mode="normal" in="SourceGraphic" in2="shadow" result="shape" />
            </filter>
          </defs>
        </svg>
        <span
          style={{ backgroundColor: background }}
          className={cn(
            'mt-4 ml-3.5 block w-max max-w-64 truncate rounded-sm px-1.5 py-0.5 text-extra-small font-semi-bold',
            isLightColor(background) ? 'text-neutral-black-deep' : 'text-neutral',
          )}
        >
          {label}
        </span>
      </motion.div>
    </div>
  );
}
