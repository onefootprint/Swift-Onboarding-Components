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
  const { t } = useTranslation('pages.basic-information.form');

  return (
    <Grid.Row>
      <Grid.Column col={6}>
        <TextInput
          data-private
          hasError={!!errors[UserDataAttribute.firstName]}
          hint={
            errors[UserDataAttribute.firstName]
              ? t('first-name.error')
              : undefined
          }
          label={t('first-name.label')}
          placeholder={t('first-name.placeholder')}
          {...register(UserDataAttribute.firstName, { required: true })}
        />
      </Grid.Column>
      <Grid.Column col={6}>
        <TextInput
          data-private
          hasError={!!errors[UserDataAttribute.lastName]}
          hint={
            errors[UserDataAttribute.firstName]
              ? t('last-name.error')
              : undefined
          }
          label={t('last-name.label')}
          placeholder={t('last-name.placeholder')}
          {...register(UserDataAttribute.lastName, { required: true })}
        />
      </Grid.Column>
    </Grid.Row>
  );
};

export default NameFields;
