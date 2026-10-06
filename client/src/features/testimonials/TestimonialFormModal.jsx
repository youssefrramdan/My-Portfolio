import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { MODAL } from '@/lib/motion';
import { TESTIMONIAL_ERRORS, TESTIMONIAL_FORM } from './labels';
import { EMPTY_TESTIMONIAL, TESTIMONIAL_HONEYPOT, TESTIMONIAL_LIMITS, testimonialSchema } from './testimonialSchema';
import { useSubmitTestimonial } from './useTestimonials';

const TITLE_ID = 'testimonial-form-title';
const { fields } = TESTIMONIAL_FORM;
const FIELD_NAMES = Object.keys(fields);
const fieldId = (name) => `testimonial-${name}`;

const errorMessage = (error) => {
  if (!error.status) return TESTIMONIAL_ERRORS.network;
  if (error.status === 429) return TESTIMONIAL_ERRORS.rateLimited;
  if (error.status === 400) return TESTIMONIAL_ERRORS.invalid;
  return TESTIMONIAL_ERRORS.generic;
};

/**
 * "Leave Your Testimonial" form (Figma 505:4936). Typed values survive errors and closing; a sent form
 * is cleared, shows the review message and closes itself after `MODAL.successClose` seconds.
 */
export default function TestimonialFormModal({ open, onClose }) {
  const submit = useSubmitTestimonial();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setFocus,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testimonialSchema),
    defaultValues: EMPTY_TESTIMONIAL,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: false,
  });
  // Errors only appear on Send; touching a field clears its own error. The focus we move to the first
  // invalid field after a failed Send must not clear it, and its focus event may arrive after
  // `setFocus` returns (e.g. while the window is in the background), so the skip is keyed by field.
  const skipFocusClear = useRef(null);
  const message = useWatch({ control, name: 'message' }) ?? '';
  const { isPending, isSuccess, isError, error, reset: resetSubmit } = submit;

  useEffect(() => {
    if (open) resetSubmit();
  }, [open, resetSubmit]);

  useEffect(() => {
    if (!open || !isSuccess) return undefined;
    const timer = setTimeout(onClose, MODAL.successClose * 1000);
    return () => clearTimeout(timer);
  }, [open, isSuccess, onClose]);

  const onSubmit = (values) =>
    submit.mutate(values, {
      onSuccess: () => reset(EMPTY_TESTIMONIAL),
      onError: (failure) => {
        if (failure.status !== 400 || !Array.isArray(failure.data)) return;
        const serverErrors = {};
        failure.data.forEach(({ field, message: text }) => {
          if (!(field in fields)) return;
          serverErrors[field] = true;
          setError(field, { type: 'server', message: text });
        });
        focusFirstError(serverErrors);
      },
    });

  const focusFirstError = (fieldErrors) => {
    const first = FIELD_NAMES.find((name) => fieldErrors[name]);
    if (!first) return;
    if (document.activeElement?.id !== fieldId(first)) skipFocusClear.current = first;
    setFocus(first);
  };

  const onInvalid = (fieldErrors) => {
    resetSubmit();
    focusFirstError(fieldErrors);
  };

  const field = (name) => {
    const registered = register(name);
    return {
      id: fieldId(name),
      label: fields[name].label,
      placeholder: fields[name].placeholder,
      maxLength: TESTIMONIAL_LIMITS[name],
      error: errors[name]?.message,
      ...registered,
      onFocus: () => {
        const skip = skipFocusClear.current === name;
        skipFocusClear.current = null;
        if (!skip) clearErrors(name);
      },
      onChange: (event) => {
        skipFocusClear.current = null;
        clearErrors(name);
        return registered.onChange(event);
      },
    };
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={TITLE_ID}
      className="max-w-112 rounded-card bg-neutral-surface-0 p-space-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-space-1">
          <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">
            {TESTIMONIAL_FORM.eyebrow}
          </p>
          <h2 id={TITLE_ID} className="text-h6 font-black text-neutral-text-heading">
            {TESTIMONIAL_FORM.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={TESTIMONIAL_FORM.close}
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-neutral-icon-muted outline-none focus-visible:ring-2 focus-visible:ring-fill-primary"
        >
          <X aria-hidden className="size-5" strokeWidth={1.7} />
        </button>
      </header>

      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <fieldset disabled={isPending} className="flex flex-col gap-space-3 pt-space-3">
          <Input {...field('name')} autoComplete="name" data-autofocus />
          <Input {...field('role')} autoComplete="organization-title" />
          <Textarea {...field('message')} hint={`${message.length}/${TESTIMONIAL_LIMITS.message}`} />
        </fieldset>

        {/* Honeypot: invisible to people and screen readers, skipped by Tab; bots that fill it are dropped. */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor="testimonial-honeypot">{TESTIMONIAL_FORM.honeypot}</label>
          <input id="testimonial-honeypot" type="text" tabIndex={-1} autoComplete="off" {...register(TESTIMONIAL_HONEYPOT)} />
        </div>

        <div className="flex gap-3 pt-space-3">
          <Button type="button" shape="rect" variant="secondary" onClick={onClose} className="flex-1">
            {TESTIMONIAL_FORM.cancel}
          </Button>
          <Button type="submit" shape="rect" variant="primary" loading={isPending} disabled={isSuccess} className="flex-1">
            {isPending ? TESTIMONIAL_FORM.sending : TESTIMONIAL_FORM.send}
          </Button>
        </div>

        <div aria-live="polite" className="empty:hidden">
          {isSuccess && <p className="pt-space-2 text-small text-text-brand">{TESTIMONIAL_FORM.success}</p>}
          {isError && (
            <p role="alert" className="pt-space-2 text-small text-status-error">
              {errorMessage(error)}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
