import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Grid, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

const NameFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation('pages.basic-information');

  return (
    <Grid.Row>
      <Grid.Column col={6}>
        <TextInput
          hasError={!!errors[UserDataAttribute.firstName]}
          hint={
            errors[UserDataAttribute.firstName]
              ? t('form.first-name.error')
              : undefined
          }
          label={t('form.first-name.label')}
          placeholder={t('form.first-name.placeholder')}
          {...register(UserDataAttribute.firstName, { required: true })}
        />
      </Grid.Column>
      <Grid.Column col={6}>
        <TextInput
          hasError={!!errors[UserDataAttribute.lastName]}
          hint={
            errors[UserDataAttribute.firstName]
              ? t('form.last-name.error')
              : undefined
          }
          label={t('form.last-name.label')}
          placeholder={t('form.last-name.placeholder')}
          {...register(UserDataAttribute.lastName, { required: true })}
        />
      </Grid.Column>
    </Grid.Row>
  );
};

export default NameFields;
