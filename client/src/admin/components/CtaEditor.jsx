import { Info, TriangleAlert } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { IDENTITY_CTA_ACTIONS } from '@shared/identity';
import { cn } from '@/lib/utils';
import { CTA_LABEL_MAX } from '../lib/cta';
import FormField, { SelectInput, TextInput } from './FormField';

/**
 * One button of a form (inside a `FormProvider`): label + action, then what the action needs (a section, a URL, or
 * nothing). `sections` = the "Scroll to section" targets, `contactEmail` / `whatsapp` / `hasCv` decide the email /
 * WhatsApp / CV notes. `optional`: an empty label means "no button".
 */
export default function CtaEditor({ name, heading, idPrefix, copy, sections, contactEmail, whatsapp, hasCv, optional = false }) {
  const { register, control, setValue, formState } = useFormContext();
  const [label, action, target] = useWatch({ control, name: [`${name}.label`, `${name}.action`, `${name}.target`] });
  const errors = name.split('.').reduce((current, key) => current?.[key], formState.errors) ?? {};
  const id = (field) => `${idPrefix}-${name}-${field}`;
  const section = sections.find((item) => item.anchor === target);

  return (
    <fieldset className="flex min-w-0 flex-col gap-4 rounded-tile bg-neutral-surface-raised p-5">
      <legend className="sr-only">{heading}</legend>
      <p aria-hidden className="text-extra-small font-semi-bold text-neutral-text-label">
        {heading}
      </p>

      <FormField
        id={id('label')}
        label={copy.ctaLabel.label}
        required={!optional}
        optional={optional ? copy.ctaLabel.optional : undefined}
        error={errors.label?.message}
        count={label.length}
        max={CTA_LABEL_MAX}
      >
        {(aria) => <TextInput {...aria} size="sm" placeholder={copy.ctaLabel.placeholder} {...register(`${name}.label`)} />}
      </FormField>

      <FormField id={id('action')} label={copy.action} required={!optional}>
        {(aria) => (
          <SelectInput {...aria} size="sm" {...register(`${name}.action`, { onChange: () => setValue(`${name}.target`, '') })}>
            {IDENTITY_CTA_ACTIONS.map((value) => (
              <option key={value} value={value}>
                {copy.actions[value]}
              </option>
            ))}
          </SelectInput>
        )}
      </FormField>

      {action === 'scroll' && (
        <FormField id={id('target')} label={copy.section.label} required={!optional} error={errors.target?.message}>
          {(aria) => (
            <SelectInput {...aria} size="sm" {...register(`${name}.target`)}>
              <option value="">{copy.section.placeholder}</option>
              {sections.map((item) => (
                <option key={item.key} value={item.anchor}>
                  {item.isVisible ? item.label : copy.hiddenSection(item.label)}
                </option>
              ))}
            </SelectInput>
          )}
        </FormField>
      )}
      {action === 'scroll' && section && !section.isVisible && <Note tone="warning">{copy.hiddenWarning}</Note>}

      {action === 'link' && (
        <FormField id={id('target')} label={copy.url.label} required={!optional} error={errors.target?.message}>
          {(aria) => (
            <TextInput {...aria} size="sm" type="url" inputMode="url" placeholder={copy.url.placeholder} {...register(`${name}.target`)} />
          )}
        </FormField>
      )}

      {action === 'email' && (contactEmail ? <Note>{copy.emailInfo(contactEmail)}</Note> : <Note tone="warning">{copy.emailMissing}</Note>)}

      {action === 'whatsapp' && (whatsapp ? <Note>{copy.whatsappInfo(whatsapp)}</Note> : <Note tone="warning">{copy.whatsappMissing}</Note>)}

      {action === 'cv' && (hasCv ? <Note>{copy.cvInfo}</Note> : <Note tone="warning">{copy.cvMissing}</Note>)}
    </fieldset>
  );
}

function Note({ tone = 'info', children }) {
  const Icon = tone === 'warning' ? TriangleAlert : Info;
  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-md px-3 py-2.5 text-extra-small',
        tone === 'warning' ? 'bg-status-warning/6 text-status-warning' : 'bg-neutral-surface-section text-neutral-text-label',
      )}
    >
      <Icon aria-hidden className="mt-px size-3.5 shrink-0" />
      {children}
    </p>
  );
}
