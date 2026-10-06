import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { WORK_LIMITS as LIMITS, WORK_LINK_LABELS } from '@shared/work';
import { fieldIds } from '@/components/ui/fieldStyles';
import { useSkills } from '@/features/skills/useSkills';
import FormField, { SelectInput, TextInput } from '../../components/FormField';
import SectionCard from '../../components/SectionCard';
import Switch from '../../components/Switch';
import TagInput from '../../components/TagInput';
import { WORK_EDITOR } from './constants';

const COPY = WORK_EDITOR.details;

/** Figma 538:9295: optional facts (year, role, client), the external link, homepage feature and tags. */
export default function WorkDetailsCard({ index }) {
  const { register, control, formState, setValue } = useFormContext();
  const [role, client, cardLabel, featured, tags] = useWatch({
    control,
    name: ['role', 'client', 'cardLabel', 'featured', 'tags'],
  });
  const { errors } = formState;
  const { data: skills } = useSkills();
  const suggestions = useMemo(
    () => [...new Set((skills?.categories ?? []).flatMap((category) => category.items ?? []))],
    [skills],
  );
  const tagIds = fieldIds('work-tags');

  return (
    <SectionCard index={index} eyebrow={COPY.eyebrow} className="tablet:p-8">
      <div className="mt-6 grid gap-6 tablet:grid-cols-2">
        <FormField id="work-year" label={COPY.year.label} optional={COPY.year.optional} error={errors.year?.message}>
          {(aria) => (
            <TextInput {...aria} inputMode="numeric" maxLength={4} placeholder={COPY.year.placeholder} {...register('year')} />
          )}
        </FormField>
        <FormField
          id="work-role"
          label={COPY.role.label}
          optional={COPY.role.optional}
          error={errors.role?.message}
          count={role.length}
          max={LIMITS.role}
        >
          {(aria) => <TextInput {...aria} placeholder={COPY.role.placeholder} {...register('role')} />}
        </FormField>
        <FormField
          id="work-client"
          label={COPY.client.label}
          optional={COPY.client.optional}
          error={errors.client?.message}
          count={client.length}
          max={LIMITS.client}
        >
          {(aria) => <TextInput {...aria} placeholder={COPY.client.placeholder} {...register('client')} />}
        </FormField>
        <FormField
          id="work-link"
          label={COPY.externalLink.label}
          optional={COPY.externalLink.optional}
          error={errors.externalLink?.message}
        >
          {(aria) => (
            <TextInput
              {...aria}
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder={COPY.externalLink.placeholder}
              {...register('externalLink')}
            />
          )}
        </FormField>
        <FormField id="work-link-label" label={COPY.linkLabel.label} hint={COPY.linkLabel.hint}>
          {(aria) => (
            <SelectInput {...aria} {...register('linkLabel')}>
              {WORK_LINK_LABELS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </SelectInput>
          )}
        </FormField>
        <FormField
          id="work-card-label"
          label={COPY.cardLabel.label}
          optional={COPY.cardLabel.optional}
          hint={COPY.cardLabel.hint}
          error={errors.cardLabel?.message}
          count={cardLabel.length}
          max={LIMITS.cardLabel}
        >
          {(aria) => <TextInput {...aria} placeholder={COPY.cardLabel.placeholder} {...register('cardLabel')} />}
        </FormField>
        <div className="flex items-center justify-between gap-4 self-end rounded-md bg-neutral-surface-input px-4 py-3 tablet:min-h-12">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span id="work-featured-label" className="text-small font-semi-bold text-text-primary">
              {COPY.featured.label}
            </span>
            <span id="work-featured-text" className="text-extra-small text-neutral-text-placeholder">
              {COPY.featured.text}
            </span>
          </div>
          <Switch
            on={featured}
            onToggle={() => setValue('featured', !featured, { shouldDirty: true })}
            labelledBy="work-featured-label"
            describedBy="work-featured-text"
          />
        </div>

        <div className="flex flex-col gap-2.5 tablet:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="work-tags" className="text-extra-small font-semi-bold text-neutral-text-muted">
              {COPY.tags.label}
            </label>
            <span aria-hidden className="text-extra-small text-neutral-text-placeholder tabular-nums">
              {COPY.tags.count(tags.length)}
            </span>
          </div>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                id="work-tags"
                value={field.value}
                onChange={field.onChange}
                suggestions={suggestions}
                describedBy={tagIds.hint}
                copy={COPY.tags}
                max={LIMITS.tags}
                maxLength={LIMITS.tag}
              />
            )}
          />
          <p id={tagIds.hint} className="text-extra-small text-neutral-text-placeholder">
            {errors.tags?.message ?? COPY.tags.hint}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
