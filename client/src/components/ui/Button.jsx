import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useState } from 'react';
import { EASE, GLOW_SPRING, HOVER } from '@/lib/motion';
import { cn } from '@/lib/utils';

const shapes = {
  pill: {
    base: 'rounded-full px-6 font-medium',
    variants: {
      primary: 'bg-fill-primary text-neutral-surface-2',
      secondary: 'bg-neutral-surface-2 text-text-primary',
    },
  },
  // Figma form buttons (testimonial modal): full width, rounded rectangle, no shine.
  rect: {
    base: 'w-full rounded-md px-space-2',
    variants: {
      primary: 'bg-fill-primary font-semi-bold text-surface-secondary',
      secondary: 'bg-neutral-surface-control font-regular text-neutral-text-muted',
    },
  },
};

const sizes = {
  md: 'h-12',
  sm: 'h-11.5',
};

const shine = {
  rest: { left: '-40%', top: '-120%', opacity: 0, transition: { duration: 0 } },
  hover: {
    left: '120%',
    top: '20%',
    opacity: [0, 1, 0],
    transition: { duration: HOVER.shine, ease: EASE },
  },
};

const iconTurn = {
  rest: { rotate: 0, transition: { duration: HOVER.arrow, ease: EASE } },
  hover: { rotate: 45, transition: { duration: HOVER.arrow, ease: EASE } },
};

/**
 * Button from the Figma "CTA Button" component (`shape="pill"`) or the form buttons (`shape="rect"`).
 * - Shine (pill only): a light band sweeps top-left to bottom-right on hover.
 * - `rotateIcon`: the trailing icon turns 45deg on hover (arrow-up-right becomes horizontal).
 * - `glow`: a soft cloud follows the cursor inside the button and slowly shifts hue.
 * - `loading`: disables the button and marks it busy.
 * Renders an `<a>` when `href` is given, otherwise a `<button>`.
 */
export default function Button({
  variant = 'secondary',
  shape = 'pill',
  size = 'md',
  icon,
  rotateIcon = false,
  glow = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const glowX = useSpring(useMotionValue(0), GLOW_SPRING);
  const glowY = useSpring(useMotionValue(0), GLOW_SPRING);
  const Component = props.href !== undefined ? motion.a : motion.button;
  const isDisabled = disabled || loading;
  const animated = !reduce && !isDisabled;
  const withGlow = glow && animated;
  const withShine = shape === 'pill' && !reduce;
  const style = shapes[shape];

  const handlePointerMove = (event) => {
    if (!withGlow) return;
    const rect = event.currentTarget.getBoundingClientRect();
    glowX.set(event.clientX - rect.left);
    glowY.set(event.clientY - rect.top);
  };

  return (
    <Component
      initial="rest"
      animate="rest"
      whileHover={animated ? 'hover' : undefined}
      whileFocus={animated ? 'hover' : undefined}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onPointerMove={handlePointerMove}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'relative isolate inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden text-base whitespace-nowrap outline-none',
        'focus-visible:ring-2 focus-visible:ring-fill-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
        'disabled:cursor-not-allowed disabled:opacity-60',
        style.base,
        style.variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {withGlow && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 -z-10 size-24 -translate-1/2 rounded-full blur-xl"
          style={{ x: glowX, y: glowY }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: HOVER.glowFade, ease: EASE }}
        >
          <span className="block size-full animate-hue-shift rounded-full bg-radial from-neutral via-brand-color to-transparent" />
        </motion.span>
      )}

      <span className="relative z-10">{children}</span>

      {icon && (
        <motion.span
          aria-hidden
          variants={rotateIcon ? iconTurn : undefined}
          className="relative z-10 flex size-6 items-center justify-center"
        >
          {icon}
        </motion.span>
      )}

      {withShine && (
        <motion.span
          aria-hidden
          variants={shine}
          className="pointer-events-none absolute z-20 h-28 w-5 rotate-45 bg-neutral-brand-white blur-sm"
        />
      )}
    </Component>
  );
}
