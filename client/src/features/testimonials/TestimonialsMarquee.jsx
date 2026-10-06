import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MARQUEE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import TestimonialCard from './TestimonialCard';

/** Cards that still get their own stagger step; the rest enter with the last one. */
const STAGGERED_CARDS = 4;
/** A release this long after the last move is a stop, not a fling. */
const FLING_WINDOW_MS = 100;

const clampFling = (velocity) => Math.max(-MARQUEE.maxFling, Math.min(MARQUEE.maxFling, velocity));

/**
 * The testimonial cards as one endless row (tilted like the Figma strip from tablet up).
 * - The list is repeated enough times to always cover the row, and the track wraps by exactly one copy, so the
 *   loop never jumps (works with a single testimonial too).
 * - Moves on its own; it can also be dragged (mouse / touch, with a fling), swiped sideways on a trackpad, or
 *   moved one card with the arrow keys. Its speed then eases back to the auto speed. Hover / focus pause it.
 * - Reduced motion: no auto-scroll, a single copy in a horizontally scrollable row.
 * `cardVariants` / `firstIndex` = the section's reveal variants and the first card's stagger index.
 */
export default function TestimonialsMarquee({ testimonials, labelledBy, cardVariants, firstIndex }) {
  const reduce = useReducedMotion();
  const viewportRef = useRef(null);
  const copyRef = useRef(null);
  const paused = useRef(false);
  const velocity = useRef(-MARQUEE.speed);
  const drag = useRef(null);
  const x = useMotionValue(0);
  const [loop, setLoop] = useState({ copies: 1, width: 0 });

  useLayoutEffect(() => {
    if (reduce) return undefined;
    const viewport = viewportRef.current;
    const copy = copyRef.current;
    const measure = () => {
      const width = copy.offsetWidth;
      if (!width) return;
      setLoop({ width, copies: Math.ceil(viewport.offsetWidth / width) + 1 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(copy);
    return () => observer.disconnect();
  }, [reduce, testimonials]);

  const moveBy = (distance) => {
    const width = loop.width;
    if (!width) return;
    let next = x.get() + distance;
    while (next <= -width) next += width;
    while (next > 0) next -= width;
    x.set(next);
  };

  useAnimationFrame((_, delta) => {
    if (reduce || drag.current?.moved || !loop.width) return;
    const seconds = Math.min(delta, MARQUEE.maxStep) / 1000;
    const target = paused.current ? 0 : -MARQUEE.speed;
    velocity.current = target + (velocity.current - target) * Math.exp(-MARQUEE.friction * seconds);
    moveBy(velocity.current * seconds);
  });

  // Native listener: React's wheel handler is passive, and a sideways swipe must not also trigger the browser's
  // back / forward gesture.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (reduce || !viewport) return undefined;
    const onWheel = (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      velocity.current = 0;
      moveBy(-event.deltaX);
    };
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  });

  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };

  const onPointerDown = (event) => {
    if (reduce || !event.isPrimary || event.button !== 0) return;
    drag.current = { id: event.pointerId, startX: event.clientX, lastX: event.clientX, lastTime: event.timeStamp, moved: false };
  };

  const onPointerMove = (event) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    if (!state.moved) {
      if (Math.abs(event.clientX - state.startX) < MARQUEE.dragThreshold) return;
      state.moved = true;
      state.lastX = event.clientX;
      velocity.current = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    const distance = event.clientX - state.lastX;
    const elapsed = event.timeStamp - state.lastTime;
    moveBy(distance);
    if (elapsed > 0) velocity.current = 0.8 * ((distance / elapsed) * 1000) + 0.2 * velocity.current;
    state.lastX = event.clientX;
    state.lastTime = event.timeStamp;
  };

  const endDrag = (event) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    if (!state.moved) return;
    velocity.current = event.timeStamp - state.lastTime > FLING_WINDOW_MS ? 0 : clampFling(velocity.current);
  };

  const onKeyDown = (event) => {
    if (reduce || !loop.width || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    const cardStep = loop.width / testimonials.length;
    // Eased travel of an extra speed v is v / friction, so this moves about one card.
    velocity.current += (event.key === 'ArrowRight' ? -1 : 1) * cardStep * MARQUEE.friction;
  };

  const copies = reduce ? 1 : loop.copies;

  return (
    <div
      ref={viewportRef}
      role="region"
      aria-labelledby={labelledBy}
      tabIndex={0}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onDragStart={(event) => event.preventDefault()}
      className={cn(
        // Wider than the section so the tilted strip still reaches both screen edges.
        '-mx-10 rounded-card outline-none focus-visible:ring-2 focus-visible:ring-fill-primary tablet:-translate-y-8 tablet:-rotate-6',
        reduce
          ? 'snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'touch-pan-y select-none',
      )}
    >
      <motion.div className="flex w-max" style={reduce ? undefined : { x }}>
        {Array.from({ length: copies }, (_, copy) => (
          <div
            key={copy}
            ref={copy === 0 ? copyRef : undefined}
            aria-hidden={copy > 0 || undefined}
            className={cn(
              'flex gap-space-2 pr-space-2 tablet:gap-space-3 tablet:pr-space-3',
              reduce && 'ml-10 pl-grid-margin',
            )}
          >
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial._id}
                testimonial={testimonial}
                variants={cardVariants}
                custom={firstIndex + Math.min(copy * testimonials.length + index, STAGGERED_CARDS)}
                className={reduce ? 'snap-start scroll-ml-14' : undefined}
              />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
