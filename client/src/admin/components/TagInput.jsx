import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from './buttonStyles';

const MAX_SUGGESTIONS = 8;

const sameTag = (a, b) => a.toLowerCase() === b.toLowerCase();

/**
 * Chip input: type a tag and press Enter (or a comma) to add it, Backspace on an empty input removes the last one.
 * `suggestions` matching the typed text are offered first as one-click chips. `max` tags of up to `maxLength`
 * characters; `copy` = `{ placeholder, max, remove(tag), suggestions }`.
 */
export default function TagInput({ id, value, onChange, suggestions = [], describedBy, copy, max, maxLength }) {
  const [draft, setDraft] = useState('');
  const isFull = value.length >= max;
  const query = draft.trim().toLowerCase();

  const add = (raw) => {
    const tag = raw.trim().slice(0, maxLength);
    if (!tag || isFull || value.some((current) => sameTag(current, tag))) return;
    onChange([...value, tag]);
    setDraft('');
  };
  const remove = (tag) => onChange(value.filter((current) => current !== tag));

  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(draft);
    } else if (event.key === 'Backspace' && !draft && value.length) {
      remove(value[value.length - 1]);
    }
  };

  const offered = suggestions
    .filter((skill) => !value.some((tag) => sameTag(tag, skill)))
    .filter((skill) => !query || skill.toLowerCase().includes(query))
    .sort((a, b) => Number(!a.toLowerCase().startsWith(query)) - Number(!b.toLowerCase().startsWith(query)))
    .slice(0, MAX_SUGGESTIONS);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-md bg-neutral-surface-input px-3 py-2 focus-within:ring-1 focus-within:ring-fill-primary">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-neutral-surface-control py-1 pr-1 pl-3 text-extra-small text-text-primary">
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={copy.remove(tag)}
              className={cn(
                'flex size-5 items-center justify-center rounded-full text-neutral-text-label transition-colors hover:bg-neutral-surface-input hover:text-status-error',
                FOCUS_RING,
              )}
            >
              <X aria-hidden className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && add(draft)}
          disabled={isFull}
          maxLength={maxLength}
          placeholder={isFull ? copy.max : copy.placeholder}
          aria-describedby={describedBy}
          className="h-8 min-w-40 flex-1 bg-transparent text-base text-text-primary outline-none placeholder:text-neutral-text-placeholder disabled:cursor-not-allowed"
        />
      </div>

      {offered.length > 0 && !isFull && (
        <div className="flex flex-col gap-2">
          <p className="text-extra-small text-neutral-text-placeholder">{copy.suggestions}</p>
          <ul className="flex flex-wrap gap-1.5">
            {offered.map((skill) => (
              <li key={skill}>
                <button
                  type="button"
                  onClick={() => add(skill)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-text-placeholder/60 px-2.5 py-1 text-extra-small text-neutral-text-muted transition-colors hover:border-fill-primary hover:text-text-brand',
                    FOCUS_RING,
                  )}
                >
                  <Plus aria-hidden className="size-3" />
                  {skill}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
