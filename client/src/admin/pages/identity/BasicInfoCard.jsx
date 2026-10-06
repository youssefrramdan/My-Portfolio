import { UserRound } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { IDENTITY_LIMITS as LIMITS } from '@shared/identity';
import FormField, { TextInput } from '../../components/FormField';
import SectionCard from '../../components/SectionCard';
import { IDENTITY } from './constants';

const COPY = IDENTITY.basic;

/** Figma 538:8170: display name (the big name behind the hero photo) and the role shown in the hero pill. */
export default function BasicInfoCard({ index }) {
  const { register, control, formState } = useFormContext();
  const [displayName, role] = useWatch({ control, name: ['displayName', 'role'] });
  const { errors } = formState;

  return (
    <SectionCard index={index} icon={UserRound} title={COPY.title} description={COPY.description}>
      <div className="mt-7 grid gap-6 tablet:grid-cols-2">
        <FormField
          id="identity-display-name"
          label={COPY.displayName.label}
          required
          hint={COPY.displayName.hint}
          error={errors.displayName?.message}
          count={displayName.length}
          max={LIMITS.displayName}
        >
          {(aria) => (
            <TextInput {...aria} placeholder={COPY.displayName.placeholder} autoComplete="name" {...register('displayName')} />
          )}
        </FormField>
        <FormField
          id="identity-role"
          label={COPY.role.label}
          required
          hint={COPY.role.hint}
          error={errors.role?.message}
          count={role.length}
          max={LIMITS.role}
        >
          {(aria) => <TextInput {...aria} placeholder={COPY.role.placeholder} autoComplete="organization-title" {...register('role')} />}
        </FormField>
      </div>
    </SectionCard>
  );
}
