import { useTranslation } from '@onefootprint/hooks';
import { Grid, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

type NameFieldsProps = {
  disabled?: boolean;
};

const NameFields = ({ disabled }: NameFieldsProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation('pages.basic-information.form');

  return (
    <Grid.Row>
      <Grid.Column col={6}>
        <TextInput
          data-private
          disabled={disabled}
          hasError={!!errors.firstName}
          hint={errors.firstName ? t('first-name.error') : undefined}
          label={t('first-name.label')}
          placeholder={t('first-name.placeholder')}
          {...register('firstName', { required: true })}
        />
      </Grid.Column>
      <Grid.Column col={6}>
        <TextInput
          data-private
          disabled={disabled}
          hasError={!!errors.lastName}
          hint={errors.firstName ? t('last-name.error') : undefined}
          label={t('last-name.label')}
          placeholder={t('last-name.placeholder')}
          {...register('lastName', { required: true })}
        />
      </Grid.Column>
    </Grid.Row>
  );
};

export default NameFields;
