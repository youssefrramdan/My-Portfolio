// TODO: DEV ONLY. Delete this file and its route once the tokens are verified against Figma.
// Labels here are developer annotations, not site content.
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const PRIMITIVES = [
  { name: 'neutral', className: 'bg-neutral' },
  { name: 'brand-color', className: 'bg-brand-color' },
  { name: 'neutral-brand-white', className: 'bg-neutral-brand-white' },
  { name: 'neutral-surface-black', className: 'bg-neutral-surface-black' },
  { name: 'neutral-gray', className: 'bg-neutral-gray' },
  { name: 'overlay-dark-40', className: 'bg-overlay-dark-40' },
  { name: 'overlay-gray-60', className: 'bg-overlay-gray-60' },
  { name: 'overlay-black-50', className: 'bg-overlay-black-50' },
  { name: 'neutral-black-deep', className: 'bg-neutral-black-deep' },
  { name: 'neutral-surface-1', className: 'bg-neutral-surface-1' },
  { name: 'neutral-surface-2', className: 'bg-neutral-surface-2' },
  { name: 'brand-color-dim', className: 'bg-brand-color-dim' },
  { name: 'neutral-surface-3', className: 'bg-neutral-surface-3', todo: true },
  { name: 'neutral-gray-dark', className: 'bg-neutral-gray-dark', todo: true },
];

const SEMANTICS = [
  { name: 'bg-primary', alias: 'neutral-surface-black', className: 'bg-bg-primary' },
  { name: 'card-primary', alias: 'neutral-surface-1', className: 'bg-card-primary' },
  { name: 'surface-secondary', alias: 'neutral-surface-black', className: 'bg-surface-secondary' },
  { name: 'surface-secondary-hover', alias: 'neutral-surface-3', className: 'bg-surface-secondary-hover', todo: true },
  { name: 'border-primary', alias: 'neutral-gray-dark', className: 'bg-border-primary', todo: true },
  { name: 'border-secondary', alias: 'neutral-surface-3', className: 'bg-border-secondary', todo: true },
  { name: 'border-tertiary', alias: 'overlay-dark-40', className: 'bg-border-tertiary' },
  { name: 'icon-primary', alias: 'neutral-brand-white', className: 'bg-icon-primary' },
  { name: 'icon-secondary', alias: 'neutral-gray', className: 'bg-icon-secondary' },
  { name: 'icon-hover', alias: 'brand-color', className: 'bg-icon-hover' },
  { name: 'overlay-default', alias: 'overlay-black-50', className: 'bg-overlay-default' },
  { name: 'fill-primary', alias: 'brand-color', className: 'bg-fill-primary' },
  { name: 'fill-primary-active', alias: 'brand-color-dim', className: 'bg-fill-primary-active' },
  { name: 'text-primary', alias: 'neutral-brand-white', className: 'bg-text-primary' },
  { name: 'text-secondary', alias: 'neutral-gray', className: 'bg-text-secondary' },
  { name: 'text-disabled', alias: 'overlay-gray-60', className: 'bg-text-disabled' },
  { name: 'text-brand', alias: 'brand-color', className: 'bg-text-brand' },
];

const TEXT_SIZES = [
  { name: 'h1', className: 'text-h1' },
  { name: 'h2', className: 'text-h2' },
  { name: 'h3', className: 'text-h3' },
  { name: 'h4', className: 'text-h4' },
  { name: 'h5', className: 'text-h5' },
  { name: 'h6', className: 'text-h6' },
  { name: 'extra-large', className: 'text-extra-large' },
  { name: 'large', className: 'text-large' },
  { name: 'base', className: 'text-base' },
  { name: 'small', className: 'text-small' },
  { name: 'extra-small', className: 'text-extra-small' },
];

const WEIGHTS = [
  { name: 'regular', className: 'font-regular' },
  { name: 'medium', className: 'font-medium' },
  { name: 'semi-bold', className: 'font-semi-bold' },
  { name: 'bold', className: 'font-bold' },
  { name: 'black', className: 'font-black' },
];

const SPACING = [
  { name: 'space-1', className: 'size-space-1' },
  { name: 'space-2', className: 'size-space-2' },
  { name: 'space-3', className: 'size-space-3' },
  { name: 'space-4', className: 'size-space-4' },
  { name: 'space-5', className: 'size-space-5' },
  { name: 'grid-margin', className: 'size-grid-margin' },
  { name: 'grid-gutter', className: 'size-grid-gutter' },
];

const RADII = [
  { name: 'none', className: 'rounded-none' },
  { name: 'xs', className: 'rounded-xs' },
  { name: 'sm', className: 'rounded-sm' },
  { name: 'md', className: 'rounded-md' },
  { name: 'lg', className: 'rounded-lg' },
  { name: 'xl', className: 'rounded-xl' },
  { name: 'full', className: 'rounded-full' },
];

const SAMPLE = 'The quick brown fox jumps over the lazy dog';

function useCssVars(names) {
  const read = () => {
    const styles = getComputedStyle(document.documentElement);
    return Object.fromEntries(names.map((n) => [n, styles.getPropertyValue(n).trim()]));
  };
  const [values, setValues] = useState(read);

  useEffect(() => {
    const onResize = () => setValues(read());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return values;
}

const toPx = (value) => (value?.endsWith('rem') ? `${parseFloat(value) * 16}px` : value);

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-space-3 border-t border-border-primary pt-space-4">
      <h2 className="text-h5 font-bold text-text-brand">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ name, className, sub, todo }) {
  return (
    <div className="flex flex-col gap-space-1">
      <div className={cn('h-space-5 w-full rounded-sm border border-neutral-gray', className)} />
      <p className="text-small font-semi-bold">
        {name}
        {todo && <span className="text-text-brand"> (TODO)</span>}
      </p>
      {sub && <p className="text-extra-small text-text-secondary">{sub}</p>}
    </div>
  );
}

export default function TokensPreview() {
  const vars = useCssVars([
    ...PRIMITIVES.map((c) => `--color-${c.name}`),
    ...TEXT_SIZES.flatMap((t) => [`--text-${t.name}`, `--text-${t.name}--line-height`]),
    ...SPACING.map((s) => `--spacing-${s.name}`),
    ...RADII.map((r) => `--radius-${r.name}`),
    '--grid-template-columns-layout',
  ]);

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-space-5 px-grid-margin py-space-5">
      <header className="flex flex-col gap-space-2">
        <h1 className="text-h3 font-black">Tokens preview</h1>
        <p className="text-text-secondary">
          Active Figma mode:{' '}
          <span className="font-bold text-text-primary tablet:hidden">iPhone / Android (base)</span>
          <span className="hidden font-bold text-text-primary tablet:inline desktop:hidden">iPad / Android Tab (tablet, 768px+)</span>
          <span className="hidden font-bold text-text-primary desktop:inline">Web / Laptop (desktop, 1440px+)</span>
        </p>
      </header>

      <Section title="Colors / Base (primitives)">
        <div className="grid grid-cols-2 gap-space-3 tablet:grid-cols-4 desktop:grid-cols-7">
          {PRIMITIVES.map((c) => (
            <Swatch key={c.name} {...c} sub={vars[`--color-${c.name}`]} />
          ))}
        </div>
      </Section>

      <Section title="Colors / Brand Colors (semantic)">
        <div className="grid grid-cols-2 gap-space-3 tablet:grid-cols-4 desktop:grid-cols-6">
          {SEMANTICS.map((c) => (
            <Swatch key={c.name} {...c} sub={`→ ${c.alias}`} />
          ))}
        </div>
      </Section>

      <Section title="Fonts / Font Size + Line Height (Montserrat)">
        <div className="flex flex-col gap-space-3">
          {TEXT_SIZES.map((t) => (
            <div key={t.name} className="flex flex-col gap-space-1 tablet:flex-row tablet:items-baseline tablet:gap-space-3">
              <p className="w-40 shrink-0 text-extra-small text-text-secondary">
                {t.name}: {toPx(vars[`--text-${t.name}`])} / {toPx(vars[`--text-${t.name}--line-height`])}
              </p>
              <p className={cn('truncate', t.className)}>{SAMPLE}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Fonts / Weight">
        <div className="flex flex-col gap-space-2">
          {WEIGHTS.map((w) => (
            <p key={w.name} className={cn('text-large', w.className)}>
              {w.name}: {SAMPLE}
            </p>
          ))}
        </div>
      </Section>

      <Section title="Responsive / Spacing + Grid">
        <div className="flex flex-wrap items-end gap-space-4">
          {SPACING.map((s) => (
            <div key={s.name} className="flex flex-col items-start gap-space-1">
              <div className={cn('bg-fill-primary', s.className)} />
              <p className="text-extra-small text-text-secondary">
                {s.name}: {toPx(vars[`--spacing-${s.name}`])}
              </p>
            </div>
          ))}
        </div>
        <p className="text-extra-small text-text-secondary">grid-cols-layout: {vars['--grid-template-columns-layout']}</p>
        <div className="grid grid-cols-layout gap-grid-gutter">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-space-5 rounded-xs bg-card-primary',
                i >= 4 && 'hidden tablet:block',
                i >= 8 && 'tablet:hidden desktop:block',
              )}
            />
          ))}
        </div>
      </Section>

      <Section title="Responsive / Radius">
        <div className="flex flex-wrap gap-space-3">
          {RADII.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-space-1">
              <div className={cn('size-20 border border-border-secondary bg-card-primary', r.className)} />
              <p className="text-extra-small text-text-secondary">
                {r.name}: {toPx(vars[`--radius-${r.name}`])}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Responsive / Breakpoints">
        <p className="text-small text-text-secondary">
          base (390 design) · tablet: 768px · desktop: 1440px. Tailwind defaults sm/md/lg/xl/2xl are also kept.
        </p>
      </Section>
    </main>
  );
}
