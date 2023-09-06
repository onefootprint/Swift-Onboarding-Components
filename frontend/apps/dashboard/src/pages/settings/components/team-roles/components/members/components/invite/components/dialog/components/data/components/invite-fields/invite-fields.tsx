import { useTranslation } from '@onefootprint/hooks';
import type { SelectOption } from '@onefootprint/ui';
import { Grid, Select, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export type InviteFieldsProps = {
  index: number;
  roles: SelectOption[];
};

const InviteFields = ({ index, roles }: InviteFieldsProps) => {
  const { t } = useTranslation('pages.settings.members.invite');
  const { register, control } = useFormContext();
  const shouldShowLabel = index === 0;
  const isRequired = index === 0;

  return (
    <Grid.Row>
      <Grid.Column col={8}>
        <TextInput
          type="email"
          label={shouldShowLabel ? t('form.email.label') : undefined}
          placeholder={t('form.email.placeholder')}
          {...register(
            `invitations.${index}.email`,
            isRequired
              ? {
                  required: {
                    value: true,
                    message: t('form.email.errors.required'),
                  },
                }
              : undefined,
          )}
        />
      </Grid.Column>
      <Grid.Column col={4}>
        <Controller
          control={control}
          name={`invitations.${index}.role`}
          rules={{ required: isRequired }}
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
      </Grid.Column>
    </Grid.Row>
  );
};

export default InviteFields;
