import { Plus, X } from 'lucide-react';
import { useId } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { IDENTITY_LIMITS as LIMITS } from '@shared/identity';
import { adminButton } from '../../components/buttonStyles';
import { TextInput } from '../../components/FormField';
import IconPicker from '../../components/IconPicker';
import SortableList, { SortableRow } from '../../components/SortableList';
import Switch from '../../components/Switch';
import { IDENTITY } from './constants';
import { newSkillTag, newStat } from './identityForm';

const COPY = IDENTITY.display;

/** Figma 546:12416: show / hide the floating tags and the stat cards, and edit both lists (drag to reorder). */
export default function DisplayOptionsTab() {
  const { control, setValue } = useFormContext();
  const [showSkillTags, showStats] = useWatch({ control, name: ['showSkillTags', 'showStats'] });
  const toggle = (name, value) => setValue(name, !value, { shouldDirty: true });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-5">
        <p className="text-extra-small text-neutral-text-label">{COPY.intro}</p>
        <div className="flex flex-col gap-2">
          <SwitchRow copy={COPY.skillTags} on={showSkillTags} onToggle={() => toggle('showSkillTags', showSkillTags)} />
          <SwitchRow copy={COPY.stats} on={showStats} onToggle={() => toggle('showStats', showStats)} />
        </div>
      </div>
      <Highlights hidden={!showStats} />
      <CapabilityTags hidden={!showSkillTags} />
    </div>
  );
}

function SwitchRow({ copy, on, onToggle }) {
  const labelId = useId();
  const textId = useId();
  return (
    <div className="flex items-center gap-4 rounded-tile bg-neutral-surface-raised p-5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span id={labelId} className="text-extra-small font-semi-bold text-neutral-text-heading">
          {copy.label}
        </span>
        <span id={textId} className="text-extra-small text-neutral-text-placeholder">
          {copy.text}
        </span>
      </div>
      <Switch on={on} onToggle={onToggle} labelledBy={labelId} describedBy={textId} />
    </div>
  );
}

function ListHeader({ title, text, addLabel, onAdd, disabled, note }) {
  return (
    <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
      <div className="flex flex-col gap-1">
        <h3 className="text-extra-small font-semi-bold text-neutral-text-heading">{title}</h3>
        <p className="text-extra-small text-neutral-text-placeholder">{note ?? text}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className={adminButton({ variant: 'secondary', size: 'sm', className: 'self-start text-text-brand tablet:self-auto' })}
      >
        <Plus aria-hidden className="size-4" />
        {addLabel}
      </button>
    </div>
  );
}

function RemoveButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={adminButton({ variant: 'secondary', size: 'icon', className: 'size-10 hover:text-status-error' })}
    >
      <X aria-hidden className="size-4" />
    </button>
  );
}

function Highlights({ hidden }) {
  const { control, register, formState } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'stats' });
  const copy = COPY.highlights;
  const isFull = fields.length >= LIMITS.stats;
  const ids = fields.map((field) => field.id);
  const errors = formState.errors.stats ?? [];

  return (
    <section className="flex flex-col gap-4">
      <ListHeader
        title={copy.title}
        text={copy.text}
        note={isFull ? copy.max : hidden ? COPY.hiddenNote : undefined}
        addLabel={copy.add}
        onAdd={() => append(newStat())}
        disabled={isFull}
      />
      {fields.length ? (
        <SortableList
          ids={ids}
          onMove={move}
          labelOf={(id) => copy.itemLabel(ids.indexOf(id) + 1)}
          labels={COPY}
          className="flex flex-col gap-2"
        >
          {fields.map((field, index) => {
            const rowErrors = errors[index] ?? {};
            const message = rowErrors.value?.message || rowErrors.title?.message || rowErrors.label?.message;
            return (
              <SortableRow key={field.id} id={field.id} handleLabel={copy.move(index + 1)} className="flex-wrap tablet:flex-nowrap">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <TextInput
                    size="row"
                    aria-label={`${copy.value} ${index + 1}`}
                    aria-invalid={rowErrors.value ? true : undefined}
                    placeholder={copy.valuePlaceholder}
                    className="w-20 font-bold text-text-brand"
                    {...register(`stats.${index}.value`)}
                  />
                  <TextInput
                    size="row"
                    aria-label={`${copy.titleLabel} ${index + 1}`}
                    aria-invalid={rowErrors.title ? true : undefined}
                    placeholder={copy.titlePlaceholder}
                    className="min-w-36 flex-1"
                    {...register(`stats.${index}.title`)}
                  />
                  <TextInput
                    size="row"
                    aria-label={`${copy.pill} ${index + 1}`}
                    aria-invalid={rowErrors.label ? true : undefined}
                    placeholder={copy.pillPlaceholder}
                    className="w-full tablet:w-36"
                    {...register(`stats.${index}.label`)}
                  />
                  {message && (
                    <p role="alert" className="w-full text-extra-small text-status-error">
                      {message}
                    </p>
                  )}
                </div>
                <RemoveButton label={copy.remove(index + 1)} onClick={() => remove(index)} />
              </SortableRow>
            );
          })}
        </SortableList>
      ) : (
        <p className="rounded-tile bg-neutral-surface-raised p-4 text-extra-small text-neutral-text-label">{copy.empty}</p>
      )}
    </section>
  );
}

function CapabilityTags({ hidden }) {
  const { control, register, setValue, formState } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'skillTags' });
  const icons = useWatch({ control, name: 'skillTags' });
  const copy = COPY.tags;
  const isFull = fields.length >= LIMITS.skillTags;
  const ids = fields.map((field) => field.id);
  const errors = formState.errors.skillTags ?? [];

  return (
    <section className="flex flex-col gap-4">
      <ListHeader
        title={copy.title}
        text={copy.text}
        note={hidden ? COPY.hiddenNote : undefined}
        addLabel={copy.add}
        onAdd={() => append(newSkillTag())}
        disabled={isFull}
      />
      {fields.length ? (
        <SortableList
          ids={ids}
          onMove={move}
          labelOf={(id) => copy.itemLabel(ids.indexOf(id) + 1)}
          labels={COPY}
          className="flex flex-col gap-2"
        >
          {fields.map((field, index) => (
            <SortableRow key={field.id} id={field.id} handleLabel={copy.move(index + 1)}>
              <IconPicker
                value={{ name: icons[index]?.icon, nodes: icons[index]?.iconNodes }}
                copy={COPY.iconPicker}
                onChange={({ name, nodes }) => {
                  setValue(`skillTags.${index}.iconNodes`, nodes, { shouldDirty: true });
                  setValue(`skillTags.${index}.icon`, name, { shouldDirty: true });
                }}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <TextInput
                  size="row"
                  aria-label={`${copy.label} ${index + 1}`}
                  aria-invalid={errors[index]?.label ? true : undefined}
                  placeholder={copy.placeholder}
                  {...register(`skillTags.${index}.label`)}
                />
                {errors[index]?.label && (
                  <p role="alert" className="text-extra-small text-status-error">
                    {errors[index].label.message}
                  </p>
                )}
              </div>
              <RemoveButton label={copy.remove(index + 1)} onClick={() => remove(index)} />
            </SortableRow>
          ))}
        </SortableList>
      ) : (
        <p className="rounded-tile bg-neutral-surface-raised p-4 text-extra-small text-neutral-text-label">{copy.empty}</p>
      )}
    </section>
  );
}
