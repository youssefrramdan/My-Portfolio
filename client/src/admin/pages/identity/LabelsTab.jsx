import { CornerDownLeft, Image as ImageIcon } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { anchorIndex, IDENTITY_LIMITS as LIMITS, titleWords } from '@shared/identity';
import CtaEditor from '../../components/CtaEditor';
import FormField, { TextArea, TextInput } from '../../components/FormField';
import { IDENTITY } from './constants';

const COPY = IDENTITY.labels;

/** Figma 546:12000: title (split into words), optional description and the two hero buttons. */
export default function LabelsTab({ state, onTitleBlur }) {
  const { register, control, formState } = useFormContext();
  const [title, description, imageSlots, lineBreak, cvUrl] = useWatch({
    control,
    name: ['title', 'description', 'imageSlots', 'lineBreak', 'cv.url'],
  });
  const { errors } = formState;
  const titleField = register('title');
  const words = titleWords(title);
  const spotAt = new Set(imageSlots.map((slot) => anchorIndex(words, slot)));
  const breakAt = anchorIndex(words, lineBreak);

  return (
    <div className="flex flex-col gap-6">
      <FormField
        id="identity-title"
        label={COPY.title.label}
        required
        error={errors.title?.message}
        count={title.length}
        max={LIMITS.title}
      >
        {(aria) => (
          <TextInput
            {...aria}
            placeholder={COPY.title.placeholder}
            {...titleField}
            onBlur={(event) => {
              titleField.onBlur(event);
              onTitleBlur();
            }}
          />
        )}
      </FormField>

      {words.length > 0 && (
        <div className="-mt-3 flex flex-wrap items-center gap-2">
          <span className="text-extra-small text-neutral-text-placeholder">{COPY.words}</span>
          <ul className="flex flex-wrap gap-2">
            {words.map((word, index) => (
              <li
                key={`${word}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-surface-input px-2.5 py-1 text-extra-small text-neutral-text-muted"
              >
                {word}
                {spotAt.has(index) && (
                  <>
                    <ImageIcon aria-hidden className="size-3 text-text-brand" />
                    <span className="sr-only">{COPY.wordImage}</span>
                  </>
                )}
                {breakAt === index && (
                  <>
                    <CornerDownLeft aria-hidden className="size-3 text-text-brand" />
                    <span className="sr-only">{COPY.wordBreak}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormField
        id="identity-description"
        label={COPY.description.label}
        optional={COPY.description.optional}
        error={errors.description?.message}
        count={description.length}
        max={LIMITS.description}
      >
        {(aria) => <TextArea {...aria} rows={4} placeholder={COPY.description.placeholder} {...register('description')} />}
      </FormField>

      <div className="flex flex-col gap-4">
        <h3 className="text-extra-small font-semi-bold text-neutral-text-heading">{COPY.ctas}</h3>
        <div className="grid gap-4 tablet:grid-cols-2">
          {['ctaPrimary', 'ctaSecondary'].map((name) => (
            <CtaEditor
              key={name}
              name={name}
              heading={name === 'ctaPrimary' ? COPY.primary : COPY.secondary}
              idPrefix="identity"
              copy={COPY}
              sections={state.sections}
              contactEmail={state.contactEmail}
              whatsapp={state.whatsapp}
              hasCv={Boolean(cvUrl)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
