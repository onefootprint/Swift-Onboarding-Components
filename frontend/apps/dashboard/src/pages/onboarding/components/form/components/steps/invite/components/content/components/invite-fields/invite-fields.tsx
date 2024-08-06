import type { SelectOption } from '@onefootprint/ui';
import { Grid, Select, TextInput } from '@onefootprint/ui';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type InviteFieldsProps = {
  index: number;
  roles: SelectOption[];
};

const InviteFields = ({ index, roles }: InviteFieldsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.onboarding.invite',
  });
  const { register, control } = useFormContext();
  const shouldShowLabel = index === 0;

  return (
    <Grid.Container columns={['2fr', '1fr']} gap={7}>
      <TextInput
        autoFocus
        type="email"
        label={shouldShowLabel ? t('form.email.label') : undefined}
        placeholder={t('form.email.placeholder')}
        {...register(`invitations.${index}.email`)}
      />
      <Controller
        control={control}
        name={`invitations.${index}.role`}
        render={select => (
          <Select
            hasError={!!select.fieldState.error}
            hint={select.fieldState.error && t('form.role.errors.required')}
            label={shouldShowLabel ? t('form.role.label') : undefined}
            onBlur={select.field.onBlur}
            onChange={select.field.onChange}
            options={roles}
            placeholder={t('form.role.placeholder')}
            value={select.field.value}
          />
        )}
      />
    </Grid.Container>
  );
};

export default InviteFields;
