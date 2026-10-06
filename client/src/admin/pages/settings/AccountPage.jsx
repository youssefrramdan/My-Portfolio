import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, LoaderCircle, Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PASSWORD_LIMITS } from '@shared/settings';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import EditorHint from '../../components/content/EditorHint';
import FormField, { TextInput } from '../../components/FormField';
import SectionCard from '../../components/SectionCard';
import { useChangeEmail, useChangePassword } from '../../hooks/useAccount';
import { useMe } from '../../hooks/useAuth';
import { ACCOUNT as COPY, SETTINGS } from './constants';
import SettingsShell, { SETTINGS_ASIDE, SETTINGS_GRID } from './SettingsShell';
import { emailSchema, passwordSchema } from './settingsForms';

/**
 * `/admin/settings/account`: the login email and password. Both need the current password and are saved with
 * their own button (no autosave).
 */
export default function AccountPage() {
  const { data: user } = useMe();
  return (
    <SettingsShell copy={COPY} note={SETTINGS.bar.account}>
      <div className={SETTINGS_GRID}>
        <div className="flex min-w-0 flex-col gap-5 xl:self-start">
          <EmailCard index={3} currentEmail={user?.email ?? ''} />
          <PasswordCard index={4} email={user?.email ?? ''} />
        </div>
        <aside className={SETTINGS_ASIDE}>
          <EditorHint title={COPY.hint.title} text={COPY.hint.text} />
        </aside>
      </div>
    </SettingsShell>
  );
}

/**
 * Server problems go on their fields (wrong current password, email taken); anything else (too many attempts,
 * network) becomes the form notice.
 */
function showServerError(error, { setError, setNotice, conflictField }) {
  const problems = Array.isArray(error?.data) ? error.data : [];
  problems.forEach((problem) => setError(problem.field, { type: 'server', message: problem.message }, { shouldFocus: true }));
  if (error?.status === 409 && conflictField) {
    setError(conflictField, { type: 'server', message: error.message }, { shouldFocus: true });
  } else if (problems.length === 0) {
    setNotice({ tone: 'error', text: error?.status === 429 ? error.message : COPY.error });
  }
}

function EmailCard({ index, currentEmail }) {
  const schema = useMemo(() => emailSchema(currentEmail.toLowerCase()), [currentEmail]);
  const { register, handleSubmit, setError, reset, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', currentPassword: '' },
  });
  const { mutate, isPending } = useChangeEmail();
  const [notice, setNotice] = useState(null);
  const { errors } = formState;

  const submit = handleSubmit(({ email, currentPassword }) => {
    setNotice(null);
    mutate(
      { email: email.trim(), currentPassword },
      {
        onSuccess: () => {
          reset();
          setNotice({ tone: 'success', text: COPY.email.success });
        },
        onError: (error) => showServerError(error, { setError, setNotice, conflictField: 'email' }),
      },
    );
  });

  return (
    <SectionCard index={index} icon={Mail} title={COPY.email.title} description={COPY.email.description} className="tablet:p-8">
      <form noValidate onSubmit={submit} className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1 rounded-tile bg-neutral-surface-raised px-4 py-3">
          <span className="text-extra-small text-neutral-text-placeholder">{COPY.email.current}</span>
          <span className="truncate text-small font-semi-bold text-neutral-text-heading">{currentEmail}</span>
        </div>
        <div className="grid gap-5 tablet:grid-cols-2">
          <FormField id="account-email" label={COPY.email.label} required error={errors.email?.message}>
            {(aria) => (
              <TextInput {...aria} type="email" inputMode="email" autoComplete="email" placeholder={COPY.email.placeholder} {...register('email')} />
            )}
          </FormField>
          <PasswordField
            id="account-email-password"
            label={COPY.currentPassword.label}
            error={errors.currentPassword?.message}
            autoComplete="current-password"
            registration={register('currentPassword')}
          />
        </div>
        <FormFooter notice={notice} pending={isPending} label={COPY.email.submit} pendingLabel={COPY.email.saving} />
      </form>
    </SectionCard>
  );
}

function PasswordCard({ index, email }) {
  const { register, handleSubmit, setError, reset, formState } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const { mutate, isPending } = useChangePassword();
  const [notice, setNotice] = useState(null);
  const { errors } = formState;

  const submit = handleSubmit(({ currentPassword, newPassword }) => {
    setNotice(null);
    mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          reset();
          setNotice({ tone: 'success', text: COPY.password.success });
        },
        onError: (error) => showServerError(error, { setError, setNotice }),
      },
    );
  });

  return (
    <SectionCard index={index} icon={KeyRound} title={COPY.password.title} description={COPY.password.description} className="tablet:p-8">
      <form noValidate onSubmit={submit} className="mt-6 flex flex-col gap-5">
        {/* Lets password managers know which account the new password belongs to. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <PasswordField
          id="account-current-password"
          label={COPY.currentPassword.label}
          error={errors.currentPassword?.message}
          autoComplete="current-password"
          registration={register('currentPassword')}
        />
        <div className="grid gap-5 tablet:grid-cols-2">
          <PasswordField
            id="account-new-password"
            label={COPY.password.newLabel}
            error={errors.newPassword?.message}
            autoComplete="new-password"
            maxLength={PASSWORD_LIMITS.max}
            registration={register('newPassword')}
          />
          <PasswordField
            id="account-confirm-password"
            label={COPY.password.confirmLabel}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            maxLength={PASSWORD_LIMITS.max}
            registration={register('confirmPassword')}
          />
        </div>
        <FormFooter notice={notice} pending={isPending} label={COPY.password.submit} pendingLabel={COPY.password.saving} />
      </form>
    </SectionCard>
  );
}

function PasswordField({ id, label, error, autoComplete, maxLength, registration }) {
  const [visible, setVisible] = useState(false);
  return (
    <FormField id={id} label={label} required error={error}>
      {(aria) => (
        <div className="relative">
          <TextInput {...aria} type={visible ? 'text' : 'password'} autoComplete={autoComplete} maxLength={maxLength} className="pr-12" {...registration} />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? COPY.hide : COPY.show}
            aria-pressed={visible}
            aria-controls={id}
            className={cn(
              'absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-sm text-neutral-icon-muted transition-colors hover:text-text-primary',
              FOCUS_RING,
            )}
          >
            {visible ? <EyeOff aria-hidden className="size-4.5" /> : <Eye aria-hidden className="size-4.5" />}
          </button>
        </div>
      )}
    </FormField>
  );
}

function FormFooter({ notice, pending, label, pendingLabel }) {
  return (
    <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
      <div aria-live="polite" className="min-w-0">
        {notice && (
          <p
            role={notice.tone === 'error' ? 'alert' : undefined}
            className={cn('text-extra-small', notice.tone === 'error' ? 'text-status-error' : 'text-text-brand')}
          >
            {notice.text}
          </p>
        )}
      </div>
      <button type="submit" disabled={pending} aria-busy={pending || undefined} className={adminButton({ variant: 'primary', className: 'shrink-0' })}>
        {pending && <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />}
        {pending ? pendingLabel : label}
      </button>
    </div>
  );
}
