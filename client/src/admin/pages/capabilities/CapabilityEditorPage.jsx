import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, TriangleAlert } from 'lucide-react';
import { useCallback } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { CAPABILITY_LIMITS as LIMITS, CAPABILITY_SOFT_ITEMS } from '@shared/capabilities';
import { adminButton } from '../../components/buttonStyles';
import ContentDeleteCard from '../../components/content/ContentDeleteCard';
import ContentEditorFrame, { EDITOR_GRID } from '../../components/content/ContentEditorFrame';
import ContentEditorHeader from '../../components/content/ContentEditorHeader';
import ContentStatusCard from '../../components/content/ContentStatusCard';
import EditorHint from '../../components/content/EditorHint';
import ImageField from '../../components/content/ImageField';
import LetterTile from '../../components/content/LetterTile';
import FormField, { TextInput } from '../../components/FormField';
import IconPicker from '../../components/IconPicker';
import SectionCard from '../../components/SectionCard';
import SortableList, { SortableRow } from '../../components/SortableList';
import { useAutosave } from '../../hooks/useAutosave';
import {
  useCapability,
  useDeleteCapability,
  useDiscardCapability,
  usePublishCapability,
  useSaveCapabilityDraft,
  useUnpublishCapability,
} from '../../hooks/useCapabilities';
import { capabilitySchema, EMPTY_GLYPH, newItem, toForm, toPayload } from './capabilityForm';
import { CAPABILITIES_PATH, CAPABILITY_EDITOR as COPY } from './constants';

const GROUP = COPY.group;

/** `/admin/content/capabilities/:id` (Figma 538:9991): one group. Edits autosave to its draft. */
export default function CapabilityEditorPage() {
  const { id } = useParams();
  const query = useCapability(id);
  return (
    <ContentEditorFrame id={id} query={query} backTo={CAPABILITIES_PATH} copy={COPY}>
      {(item) => <CapabilityEditor item={item} />}
    </ContentEditorFrame>
  );
}

function CapabilityEditor({ item }) {
  const form = useForm({ defaultValues: toForm(item.content), resolver: zodResolver(capabilitySchema), mode: 'onChange' });
  const { mutateAsync } = useSaveCapabilityDraft(item._id);
  const autosave = useAutosave({ form, schema: capabilitySchema, toPayload, save: mutateAsync, leaveWarning: COPY.save.leaveWarning });
  const publish = usePublishCapability(item._id);
  const unpublish = useUnpublishCapability(item._id);
  const discard = useDiscardCapability(item._id);
  const remove = useDeleteCapability(item._id);
  const { markSaved } = autosave;
  const { reset, setError, control } = form;
  const title = useWatch({ control, name: 'title' });

  const runPublish = () =>
    publish.mutate(undefined, {
      onError: (error) => {
        if (!Array.isArray(error?.data)) return;
        error.data
          .filter((problem) => problem.field === 'title')
          .forEach((problem) => setError(problem.field, { type: 'publish', message: problem.message }));
      },
    });

  const resetTo = useCallback(
    (content) => {
      const values = toForm(content);
      markSaved(values);
      reset(values);
    },
    [markSaved, reset],
  );

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
        <ContentEditorHeader
          backTo={CAPABILITIES_PATH}
          copy={COPY}
          item={item}
          saveStatus={autosave.status}
          onRetry={autosave.retry}
          publish={publish}
          onPublish={runPublish}
        />
        <div className={EDITOR_GRID}>
          <div className="flex min-w-0 flex-col gap-5 xl:self-start">
            <GroupCard index={1} />
          </div>
          <aside className="flex min-w-0 flex-col gap-5">
            <ContentStatusCard index={1} item={item} copy={COPY} publish={publish} unpublish={unpublish} discard={discard} onDiscarded={resetTo}>
              {!item.isLive && <p className="text-extra-small text-neutral-text-placeholder">{COPY.limitNote}</p>}
            </ContentStatusCard>
            <ContentDeleteCard index={2} copy={COPY.remove} title={title || COPY.hint.title} remove={remove} backTo={CAPABILITIES_PATH} />
            <EditorHint title={title || COPY.hint.title} text={COPY.hint.text} />
          </aside>
        </div>
      </form>
    </FormProvider>
  );
}

function GroupCard({ index }) {
  const { register, control, formState } = useFormContext();
  const title = useWatch({ control, name: 'title' });
  const { errors } = formState;

  return (
    <SectionCard index={index} eyebrow={GROUP.eyebrow} className="tablet:p-8">
      <div className="mt-6 flex flex-col gap-6">
        <FormField id="capability-title" label={GROUP.title.label} required error={errors.title?.message} count={title.length} max={LIMITS.title}>
          {(aria) => <TextInput {...aria} placeholder={GROUP.title.placeholder} {...register('title')} />}
        </FormField>
        <GlyphField />
        <ImageField name="icon" idPrefix="capability" copy={GROUP.icon} altMax={LIMITS.alt} />
        <ItemsField />
      </div>
    </SectionCard>
  );
}

/** Hugeicons icon of the card; it takes the place of the uploaded image when set. */
function GlyphField() {
  const { control, setValue } = useFormContext();
  const glyph = useWatch({ control, name: 'glyph' });
  const copy = GROUP.glyph;
  const set = (value) => setValue('glyph', value, { shouldDirty: true });

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-extra-small font-semi-bold text-neutral-text-muted">
        {copy.label}
        <span className="ml-2 font-regular text-neutral-text-placeholder">{copy.optional}</span>
      </p>
      <div className="flex items-center gap-3 rounded-xl bg-neutral-surface-input p-3">
        <IconPicker value={glyph} onChange={set} copy={copy.picker} className="size-14 rounded-tile" />
        <p className="min-w-0 flex-1 text-extra-small text-neutral-text-placeholder">{glyph.name ? copy.hint : copy.none}</p>
        {glyph.name && (
          <button
            type="button"
            onClick={() => set(EMPTY_GLYPH)}
            aria-label={copy.remove}
            className={adminButton({ variant: 'secondary', size: 'icon', className: 'size-11 hover:text-status-error' })}
          >
            <Trash2 aria-hidden className="size-4" />
          </button>
        )}
      </div>
      {glyph.name && <p className="text-extra-small text-neutral-text-placeholder">{copy.imageNote}</p>}
    </div>
  );
}

/** The chips of the group: drag to reorder, edit inline, add / remove. */
function ItemsField() {
  const { register, control, formState } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'items', keyName: 'fieldKey' });
  const values = useWatch({ control, name: 'items' });
  const errors = formState.errors.items;
  const full = fields.length >= LIMITS.items;
  const labelOf = (key) => {
    const position = fields.findIndex((field) => field.key === key) + 1;
    return values[position - 1]?.value || GROUP.items.itemLabel(position);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-extra-small font-semi-bold text-neutral-text-muted">
            {GROUP.items.label}
            <span aria-hidden className="ml-1 text-text-brand">
              *
            </span>
          </p>
          <p className="text-extra-small text-neutral-text-placeholder">{GROUP.items.hint}</p>
        </div>
        <button
          type="button"
          onClick={() => append(newItem())}
          disabled={full}
          title={full ? GROUP.items.full : undefined}
          className={adminButton({ variant: 'secondary', size: 'sm' })}
        >
          <Plus aria-hidden className="size-4" />
          {GROUP.items.add}
        </button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-lg bg-neutral-surface-raised px-4 py-6 text-center text-extra-small text-neutral-text-label">{GROUP.items.empty}</p>
      ) : (
        <SortableList
          ids={fields.map((field) => field.key)}
          onMove={move}
          labelOf={labelOf}
          labels={GROUP.items}
          className="flex flex-col gap-2"
        >
          {fields.map((field, position) => (
            <SortableRow key={field.key} id={field.key} handleLabel={GROUP.items.move(position + 1)}>
              <LetterTile text={values[position]?.value} fallback={String(position + 1)} className="size-9" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <TextInput
                  size="row"
                  aria-label={GROUP.items.itemLabel(position + 1)}
                  aria-invalid={errors?.[position]?.value ? true : undefined}
                  placeholder={GROUP.items.placeholder}
                  {...register(`items.${position}.value`)}
                />
                {errors?.[position]?.value && <p className="text-extra-small text-status-error">{errors[position].value.message}</p>}
              </div>
              <span className="w-6 shrink-0 text-center text-extra-small text-neutral-text-placeholder tabular-nums">{position + 1}</span>
              <button
                type="button"
                onClick={() => remove(position)}
                aria-label={GROUP.items.remove(position + 1)}
                className={adminButton({ variant: 'secondary', size: 'icon', className: 'size-9 hover:text-status-error' })}
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            </SortableRow>
          ))}
        </SortableList>
      )}

      <div className="flex items-center justify-between gap-3">
        {fields.length > CAPABILITY_SOFT_ITEMS ? (
          <p className="flex items-start gap-2 text-extra-small text-status-warning">
            <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
            {GROUP.softLimit}
          </p>
        ) : (
          <p className="text-extra-small text-neutral-text-placeholder">{GROUP.softLimit}</p>
        )}
        <span className="shrink-0 text-extra-small text-neutral-text-placeholder tabular-nums">{GROUP.items.count(fields.length)}</span>
      </div>
    </div>
  );
}
