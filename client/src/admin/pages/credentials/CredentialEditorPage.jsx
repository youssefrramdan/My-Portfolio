import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { Controller, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { CREDENTIAL_KINDS, CREDENTIAL_LIMITS as LIMITS } from '@shared/credentials';
import { fieldIds } from '@/components/ui/fieldStyles';
import ContentDeleteCard from '../../components/content/ContentDeleteCard';
import ContentEditorFrame, { EDITOR_GRID } from '../../components/content/ContentEditorFrame';
import ContentEditorHeader from '../../components/content/ContentEditorHeader';
import ContentStatusCard from '../../components/content/ContentStatusCard';
import EditorHint from '../../components/content/EditorHint';
import ImageField from '../../components/content/ImageField';
import FormField, { SelectInput, TextArea, TextInput } from '../../components/FormField';
import SectionCard from '../../components/SectionCard';
import TagInput from '../../components/TagInput';
import { useAutosave } from '../../hooks/useAutosave';
import {
  useCredential,
  useDeleteCredential,
  useDiscardCredential,
  usePublishCredential,
  useSaveCredentialDraft,
  useUnpublishCredential,
} from '../../hooks/useCredentials';
import { CREDENTIAL_EDITOR as COPY, CREDENTIALS_PATH, KIND_LABELS } from './constants';
import { credentialSchema, toForm, toPayload } from './credentialForm';

const DETAILS = COPY.details;

/** `/admin/content/credentials/:id` (Figma 544:10639): one credential. Edits autosave to its draft. */
export default function CredentialEditorPage() {
  const { id } = useParams();
  const query = useCredential(id);
  return (
    <ContentEditorFrame id={id} query={query} backTo={CREDENTIALS_PATH} copy={COPY}>
      {(item) => <CredentialEditor item={item} />}
    </ContentEditorFrame>
  );
}

function CredentialEditor({ item }) {
  const form = useForm({ defaultValues: toForm(item.content), resolver: zodResolver(credentialSchema), mode: 'onChange' });
  const { mutateAsync } = useSaveCredentialDraft(item._id);
  const autosave = useAutosave({ form, schema: credentialSchema, toPayload, save: mutateAsync, leaveWarning: COPY.save.leaveWarning });
  const publish = usePublishCredential(item._id);
  const unpublish = useUnpublishCredential(item._id);
  const discard = useDiscardCredential(item._id);
  const remove = useDeleteCredential(item._id);
  const { markSaved } = autosave;
  const { reset, setError, control } = form;
  const [title, kind] = useWatch({ control, name: ['title', 'kind'] });

  const runPublish = () =>
    publish.mutate(undefined, {
      onError: (error) => {
        if (!Array.isArray(error?.data)) return;
        error.data.forEach((problem) => setError(problem.field, { type: 'publish', message: problem.message }));
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
          backTo={CREDENTIALS_PATH}
          copy={COPY}
          item={item}
          saveStatus={autosave.status}
          onRetry={autosave.retry}
          publish={publish}
          onPublish={runPublish}
        />
        <div className={EDITOR_GRID}>
          <div className="flex min-w-0 flex-col gap-5 xl:self-start">
            <DetailsCard index={1} />
            {kind === 'education' && <EducationCard index={2} />}
          </div>
          <aside className="flex min-w-0 flex-col gap-5">
            <ContentStatusCard index={1} item={item} copy={COPY} publish={publish} unpublish={unpublish} discard={discard} onDiscarded={resetTo} />
            <ContentDeleteCard index={2} copy={COPY.remove} title={title || COPY.hint.title} remove={remove} backTo={CREDENTIALS_PATH} />
            <EditorHint title={title || COPY.hint.title} text={COPY.hint.text} />
          </aside>
        </div>
      </form>
    </FormProvider>
  );
}

function DetailsCard({ index }) {
  const { register, control, formState } = useFormContext();
  const [title, issuer, date, detail, kind] = useWatch({ control, name: ['title', 'issuer', 'date', 'detail', 'kind'] });
  const { errors } = formState;
  const isEducation = kind === 'education';

  return (
    <SectionCard index={index} eyebrow={DETAILS.eyebrow} className="tablet:p-8">
      <div className="mt-6 flex flex-col gap-6">
        <FormField id="credential-title" label={DETAILS.title.label} required error={errors.title?.message} count={title.length} max={LIMITS.title}>
          {(aria) => <TextInput {...aria} placeholder={DETAILS.title.placeholder} {...register('title')} />}
        </FormField>
        <div className="grid gap-6 tablet:grid-cols-2">
          <FormField id="credential-kind" label={DETAILS.kind.label} required>
            {(aria) => (
              <SelectInput {...aria} {...register('kind')}>
                {CREDENTIAL_KINDS.map((value) => (
                  <option key={value} value={value}>
                    {KIND_LABELS[value]}
                  </option>
                ))}
              </SelectInput>
            )}
          </FormField>
          <FormField
            id="credential-date"
            label={DETAILS.date.label}
            required
            hint={DETAILS.date.hint}
            error={errors.date?.message}
            count={date.length}
            max={LIMITS.date}
          >
            {(aria) => <TextInput {...aria} placeholder={DETAILS.date.placeholder} {...register('date')} />}
          </FormField>
        </div>
        <FormField id="credential-issuer" label={DETAILS.issuer.label} required error={errors.issuer?.message} count={issuer.length} max={LIMITS.issuer}>
          {(aria) => <TextInput {...aria} placeholder={DETAILS.issuer.placeholder} {...register('issuer')} />}
        </FormField>
        <FormField
          id="credential-link"
          label={DETAILS.link.label}
          optional={DETAILS.link.optional}
          hint={DETAILS.link.hint}
          error={errors.link?.message}
        >
          {(aria) => <TextInput {...aria} type="url" inputMode="url" placeholder={DETAILS.link.placeholder} {...register('link')} />}
        </FormField>
        <FormField
          id="credential-detail"
          label={DETAILS.detail.label}
          optional={DETAILS.detail.optional}
          hint={isEducation ? DETAILS.detail.educationHint : DETAILS.detail.hint}
          error={errors.detail?.message}
          count={detail.length}
          max={LIMITS.detail}
        >
          {(aria) => (
            <TextArea
              {...aria}
              rows={3}
              className="min-h-20"
              placeholder={isEducation ? DETAILS.detail.educationPlaceholder : DETAILS.detail.placeholder}
              {...register('detail')}
            />
          )}
        </FormField>
      </div>
    </SectionCard>
  );
}

/** Education only: the card pill, the optional photo and the subject chips. */
function EducationCard({ index }) {
  const { control, register, formState } = useFormContext();
  const label = useWatch({ control, name: 'label' });
  const copy = COPY.education;
  const ids = fieldIds('credential-subjects');

  return (
    <SectionCard index={index} eyebrow={copy.eyebrow} className="tablet:p-8">
      <p className="mt-2 text-extra-small text-neutral-text-label">{copy.text}</p>
      <div className="mt-6">
        <FormField
          id="credential-label"
          label={copy.label.label}
          optional={copy.label.optional}
          hint={copy.label.hint}
          error={formState.errors.label?.message}
          count={label.length}
          max={LIMITS.label}
        >
          {(aria) => <TextInput {...aria} placeholder={copy.label.placeholder} {...register('label')} />}
        </FormField>
      </div>
      <div className="mt-6">
        <ImageField name="image" idPrefix="credential-image" copy={copy.image} altMax={LIMITS.alt} />
        <p className="mt-2 text-extra-small text-neutral-text-placeholder">{copy.image.hint}</p>
      </div>
      <div className="mt-6 flex flex-col gap-2.5">
        <label htmlFor="credential-subjects" className="text-extra-small font-semi-bold text-neutral-text-muted">
          {copy.subjects.label}
          <span className="ml-2 font-regular text-neutral-text-placeholder">{copy.subjects.optional}</span>
        </label>
        <Controller
          control={control}
          name="subjects"
          render={({ field }) => (
            <TagInput
              id="credential-subjects"
              value={field.value}
              onChange={field.onChange}
              describedBy={ids.hint}
              copy={copy.subjects}
              max={LIMITS.subjects}
              maxLength={LIMITS.subject}
            />
          )}
        />
        <p id={ids.hint} className="text-extra-small text-neutral-text-placeholder">
          {copy.subjects.hint}
        </p>
      </div>
    </SectionCard>
  );
}
