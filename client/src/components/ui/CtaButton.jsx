import { ctaLink } from '@/lib/cta';
import Button from './Button';

/**
 * Button driven by a CMS `{ label, action, target }` object: `scroll` smooth-scrolls to a section id, `email`
 * opens a Gmail compose tab, `link` and `cv` open a new tab. `context` (`ctaContext(settings)`) supplies the
 * contact email and resume URL. Renders nothing when the CTA has nothing to point at.
 * Other props (`variant`, `icon`, `glow`, ...) go to `Button`.
 */
export default function CtaButton({ cta, context, ...props }) {
  const link = ctaLink(cta, context);
  if (!link) return null;

  const { label, ...linkProps } = link;
  return (
    <Button {...linkProps} {...props}>
      {label}
    </Button>
  );
}
