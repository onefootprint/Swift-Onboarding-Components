import { useTranslation } from '@onefootprint/hooks';
import { Grid, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import validateName, { NameValidationError } from './validate-name';

type NameFieldsProps = {
  disabled?: boolean;
};

const NameFields = ({ disabled }: NameFieldsProps) => {
  const { t } = useTranslation('pages.basic-information.form');
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  const getFirstNameHint = () => {
    if (!errors.firstName) {
      return undefined;
    }
    const validationError = validateName(getValues('firstName'));
    if (validationError === NameValidationError.EMPTY) {
      return t('first-name.error.empty');
    }
    if (validationError === NameValidationError.SPECIAL_CHARS) {
      return t('first-name.error.special-chars');
    }
    return t('first-name.error.invalid');
  };

  const getLastNameHint = () => {
    if (!errors.lastName) {
      return undefined;
    }
    const validationError = validateName(getValues('lastName'));
    if (validationError === NameValidationError.EMPTY) {
      return t('last-name.error.empty');
    }
    if (validationError === NameValidationError.SPECIAL_CHARS) {
      return t('last-name.error.special-chars');
    }
    return t('last-name.error.invalid');
  };

  return (
    <>
      <Grid.Row>
        <Grid.Column col={12}>
          <TextInput
            data-private
            disabled={disabled}
            hasError={!!errors.firstName}
            hint={getFirstNameHint()}
            label={t('first-name.label')}
            placeholder={t('first-name.placeholder')}
            {...register('firstName', {
              required: true,
              validate: (value: string) => validateName(value) === undefined,
            })}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column col={12}>
          <TextInput
            data-private
            disabled={disabled}
            label={t('middle-name.label')}
            placeholder={t('middle-name.placeholder')}
            {...register('middleName')}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column col={12}>
          <TextInput
            data-private
            disabled={disabled}
            hasError={!!errors.lastName}
            hint={getLastNameHint()}
            label={t('last-name.label')}
            placeholder={t('last-name.placeholder')}
            {...register('lastName', {
              required: true,
              validate: (value: string) => validateName(value) === undefined,
            })}
          />
        </Grid.Column>
      </Grid.Row>
    </>
  );
};

export default NameFields;
