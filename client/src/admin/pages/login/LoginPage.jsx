import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Field from '@/components/ui/Field';
import { FIELD_CONTROL, fieldIds } from '@/components/ui/fieldStyles';
import Input from '@/components/ui/Input';
import { ADMIN_MOTION, adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton } from '../../components/buttonStyles';
import { useLogin, useMe } from '../../hooks/useAuth';
import { ADMIN_BASE } from '../../layout/navigation';
import { LOGIN } from './constants';

const schema = z.object({
  email: z.string().trim().pipe(z.email(LOGIN.validation.email)),
  password: z.string().min(1, LOGIN.validation.password),
});

/** Only send the user back to an admin page they were on (never an arbitrary URL). */
const safeRedirect = (from) => (typeof from === 'string' && from.startsWith(ADMIN_BASE) ? from : ADMIN_BASE);

export default function LoginPage() {
  const { data: user } = useMe();
  const location = useLocation();
  const navigate = useNavigate();
  const login = useLogin();
  const reduce = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const redirectTo = safeRedirect(location.state?.from);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  if (user && !login.isPending) return <Navigate to={redirectTo} replace />;

  const onSubmit = (values) => login.mutate(values, { onSuccess: () => navigate(redirectTo, { replace: true }) });

  const serverError = login.isError ? login.error.message || LOGIN.fallbackError : null;
  const card = adminEnter(reduce, { rise: ADMIN_MOTION.cardRise });
  const item = adminEnter(reduce, { delay: ADMIN_MOTION.contentDelay, stagger: ADMIN_MOTION.contentStagger });

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-bg-primary px-4 py-10">
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-120 -translate-1/2 rounded-full bg-brand-color/10 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 -z-10 size-42 -translate-1/2 rounded-full bg-brand-color/30 blur-3xl"
      />

      <motion.div
        variants={card}
        initial="hidden"
        animate="visible"
        className="w-full max-w-110 rounded-card bg-neutral-surface-0 p-6 tablet:p-10"
      >
        <motion.span
          variants={item}
          custom={0}
          initial="hidden"
          animate="visible"
          aria-hidden
          className="flex size-12 items-center justify-center rounded-md bg-fill-primary text-large font-black text-on-brand"
        >
          {LOGIN.brand}
        </motion.span>

        <motion.div variants={item} custom={1} initial="hidden" animate="visible" className="mt-8 flex flex-col gap-2">
          <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{LOGIN.eyebrow}</p>
          <h1 className="text-h4 font-black tracking-tight text-neutral-text-heading">
            {LOGIN.title.plain} <span className="text-text-brand">{LOGIN.title.highlight}</span>
          </h1>
          <p className="text-small text-neutral-text-label">{LOGIN.subtitle}</p>
        </motion.div>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
          <motion.div variants={item} custom={2} initial="hidden" animate="visible">
            <Input
              id="admin-email"
              type="email"
              label={LOGIN.email.label}
              placeholder={LOGIN.email.placeholder}
              autoComplete="username"
              inputMode="email"
              autoFocus
              error={errors.email?.message}
              {...register('email')}
            />
          </motion.div>

          <motion.div variants={item} custom={3} initial="hidden" animate="visible">
            <Field id="admin-password" label={LOGIN.password.label} error={errors.password?.message}>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={LOGIN.password.placeholder}
                  autoComplete="current-password"
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? fieldIds('admin-password').error : undefined}
                  className={cn(FIELD_CONTROL, 'h-12 pr-12')}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? LOGIN.password.hide : LOGIN.password.show}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-sm text-neutral-icon-muted transition-colors outline-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-fill-primary"
                >
                  {showPassword ? <EyeOff aria-hidden className="size-4.5" /> : <Eye aria-hidden className="size-4.5" />}
                </button>
              </div>
            </Field>
          </motion.div>

          {serverError && (
            <p role="alert" className="rounded-md bg-status-error/10 px-4 py-3 text-small text-status-error">
              {serverError}
            </p>
          )}

          <motion.div variants={item} custom={4} initial="hidden" animate="visible" className="mt-2">
            <button
              type="submit"
              disabled={login.isPending}
              aria-busy={login.isPending || undefined}
              className={adminButton({ className: 'w-full font-semi-bold' })}
            >
              {login.isPending && <LoaderCircle aria-hidden className="size-4.5 motion-safe:animate-spin" />}
              {login.isPending ? LOGIN.submitting : LOGIN.submit}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </main>
  );
}
