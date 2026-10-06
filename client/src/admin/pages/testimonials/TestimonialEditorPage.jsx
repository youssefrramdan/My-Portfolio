import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { TESTIMONIAL_LIMITS as LIMITS } from '@shared/testimonials';
import ContentDeleteCard from '../../components/content/ContentDeleteCard';
import ContentEditorFrame, { EDITOR_GRID } from '../../components/content/ContentEditorFrame';
import ContentEditorHeader from '../../components/content/ContentEditorHeader';
import ContentStatusCard from '../../components/content/ContentStatusCard';
import EditorHint from '../../components/content/EditorHint';
import ImageField from '../../components/content/ImageField';
import FormField, { TextArea, TextInput } from '../../components/FormField';
import SectionCard from '../../components/SectionCard';
import { useAutosave } from '../../hooks/useAutosave';
import {
  useDeleteTestimonial,
  useDiscardTestimonial,
  usePublishTestimonial,
  useSaveTestimonialDraft,
  useTestimonial,
  useUnpublishTestimonial,
} from '../../hooks/useTestimonialsAdmin';
import { TESTIMONIAL_EDITOR as COPY, TESTIMONIALS_PATH } from './constants';
import { testimonialSchema, toForm, toPayload } from './testimonialForm';

const DETAILS = COPY.details;
const publishLabel = (item) => (item.status === 'pending' ? COPY.publish.approve : undefined);

/** `/admin/content/testimonials/:id` (Figma 544:11333): one testimonial. Edits autosave to its draft. */
export default function TestimonialEditorPage() {
  const { id } = useParams();
  const query = useTestimonial(id);
  return (
    <ContentEditorFrame id={id} query={query} backTo={TESTIMONIALS_PATH} copy={COPY}>
      {(item) => <TestimonialEditor item={item} />}
    </ContentEditorFrame>
  );
}

function TestimonialEditor({ item }) {
  const form = useForm({ defaultValues: toForm(item.content), resolver: zodResolver(testimonialSchema), mode: 'onChange' });
  const { mutateAsync } = useSaveTestimonialDraft(item._id);
  const autosave = useAutosave({ form, schema: testimonialSchema, toPayload, save: mutateAsync, leaveWarning: COPY.save.leaveWarning });
  const publish = usePublishTestimonial(item._id);
  const unpublish = useUnpublishTestimonial(item._id);
  const discard = useDiscardTestimonial(item._id);
  const remove = useDeleteTestimonial(item._id);
  const { markSaved } = autosave;
  const { reset, setError, control } = form;
  const name = useWatch({ control, name: 'name' });

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
          backTo={TESTIMONIALS_PATH}
          copy={COPY}
          item={item}
          saveStatus={autosave.status}
          onRetry={autosave.retry}
          publish={publish}
          onPublish={runPublish}
          publishLabel={publishLabel}
        />
        <div className={EDITOR_GRID}>
          <div className="flex min-w-0 flex-col gap-5 xl:self-start">
            <DetailsCard index={1} />
          </div>
          <aside className="flex min-w-0 flex-col gap-5">
            <ContentStatusCard
              index={1}
              item={item}
              copy={COPY}
              publish={publish}
              unpublish={unpublish}
              discard={discard}
              onDiscarded={resetTo}
              text={item.status === 'pending' ? COPY.status.pendingText : undefined}
            >
              <p className="text-extra-small text-neutral-text-placeholder">{COPY.status.source[item.source]}</p>
            </ContentStatusCard>
            <ContentDeleteCard index={2} copy={COPY.remove} title={name || COPY.hint.title} remove={remove} backTo={TESTIMONIALS_PATH} />
            <EditorHint title={name || COPY.hint.title} text={COPY.hint.text} />
          </aside>
        </div>
      </form>
    </FormProvider>
  );
}

function DetailsCard({ index }) {
  const { register, control, formState } = useFormContext();
  const [name, role, message] = useWatch({ control, name: ['name', 'role', 'message'] });
  const { errors } = formState;

  return (
    <SectionCard index={index} eyebrow={DETAILS.eyebrow} className="tablet:p-8">
      <div className="mt-6 flex flex-col gap-6">
        <div className="grid gap-6 tablet:grid-cols-2">
          <FormField id="testimonial-name" label={DETAILS.name.label} required error={errors.name?.message} count={name.length} max={LIMITS.name}>
            {(aria) => <TextInput {...aria} placeholder={DETAILS.name.placeholder} {...register('name')} />}
          </FormField>
          <FormField
            id="testimonial-role"
            label={DETAILS.role.label}
            required
            hint={DETAILS.role.hint}
            error={errors.role?.message}
            count={role.length}
            max={LIMITS.role}
          >
            {(aria) => <TextInput {...aria} placeholder={DETAILS.role.placeholder} {...register('role')} />}
          </FormField>
        </div>
        <ImageField name="avatar" idPrefix="testimonial" copy={DETAILS.avatar} altMax={LIMITS.alt} round />
        <FormField
          id="testimonial-message"
          label={DETAILS.message.label}
          required
          error={errors.message?.message}
          count={message.length}
          max={LIMITS.message}
        >
          {(aria) => <TextArea {...aria} rows={6} className="min-h-36" placeholder={DETAILS.message.placeholder} {...register('message')} />}
        </FormField>
      </div>
    </SectionCard>
  );
}
