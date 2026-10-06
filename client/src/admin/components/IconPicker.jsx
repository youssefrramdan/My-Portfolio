import { LoaderCircle, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FIELD_CONTROL } from '@/components/ui/fieldStyles';
import Icon from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from './buttonStyles';
import Popover from './Popover';

/** Matches shown at once; searching narrows the rest down. */
const SHOWN = 168;

/** "PenTool01Icon" -> "pen tool 01" (label and search text). */
const toLabel = (name = '') =>
  name
    .replace(/Icon$/, '')
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .replace(/([0-9])([A-Za-z])/g, '$1 $2')
    .toLowerCase();

let iconSet = null;
/** The free Hugeicons set (about 6000 icons), loaded once, the first time a picker opens. */
function loadIcons() {
  iconSet ??= import('@hugeicons/core-free-icons').then((module) => {
    const seen = new Set();
    return Object.entries(module)
      .filter(([name, nodes]) => name.endsWith('Icon') && Array.isArray(nodes) && !seen.has(nodes) && seen.add(nodes))
      .map(([name, nodes]) => ({ name, nodes, label: toLabel(name) }));
  });
  return iconSet;
}

/**
 * Icon button that opens a searchable grid of the Hugeicons set. `value` / `onChange` use `{ name, nodes }`: the
 * Hugeicons name plus its drawing, which is saved with the content (`shared/icons.js`). An older lucide name
 * still shows on the button. `copy`: `{ button(label), search, empty, loading, loadError, more(shown, total) }`.
 */
export default function IconPicker({ value, onChange, copy, className }) {
  const label = value?.name && toLabel(value.name);
  return (
    <Popover
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label={copy.button(label)}
          title={label || undefined}
          className={cn(
            'flex h-10 w-12.5 shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-text-primary transition-colors hover:text-text-brand',
            FOCUS_RING,
            className,
          )}
        >
          <Icon name={value?.name} nodes={value?.nodes} className="size-5" />
        </button>
      )}
      className="w-80"
    >
      {({ close }) => (
        <IconGrid
          value={value?.name}
          copy={copy}
          onPick={(icon) => {
            onChange({ name: icon.name, nodes: icon.nodes });
            close();
          }}
        />
      )}
    </Popover>
  );
}

function IconGrid({ value, copy, onPick }) {
  const [icons, setIcons] = useState(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    loadIcons()
      .then((list) => active && setIcons(list))
      .catch(() => {
        iconSet = null;
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = useMemo(
    () => (icons ?? []).filter((icon) => terms.every((term) => icon.label.includes(term))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [icons, terms.join(' ')],
  );
  const shown = matches.slice(0, SHOWN);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-icon-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.search}
          aria-label={copy.search}
          autoFocus
          className={cn(FIELD_CONTROL, 'h-10 pl-9 text-small')}
        />
      </div>
      {failed ? (
        <p role="alert" className="px-2 py-4 text-center text-extra-small text-status-error">
          {copy.loadError}
        </p>
      ) : !icons ? (
        <p role="status" className="flex items-center justify-center gap-2 px-2 py-6 text-extra-small text-neutral-text-label">
          <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />
          {copy.loading}
        </p>
      ) : shown.length ? (
        <>
          <ul className="scrollbar-soft grid max-h-64 grid-cols-7 gap-1 overflow-y-auto">
            {shown.map((icon) => (
              <li key={icon.name}>
                <button
                  type="button"
                  onClick={() => onPick(icon)}
                  aria-label={icon.label}
                  aria-pressed={icon.name === value}
                  title={icon.label}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-md transition-colors hover:bg-neutral-surface-control',
                    icon.name === value ? 'bg-fill-primary/10 text-text-brand' : 'text-neutral-text-muted',
                    FOCUS_RING,
                  )}
                >
                  <Icon nodes={icon.nodes} className="size-5" />
                </button>
              </li>
            ))}
          </ul>
          {matches.length > shown.length && (
            <p className="px-1 text-extra-small text-neutral-text-placeholder">{copy.more(shown.length, matches.length)}</p>
          )}
        </>
      ) : (
        <p className="px-2 py-4 text-center text-extra-small text-neutral-text-label">{copy.empty}</p>
      )}
    </div>
  );
}
