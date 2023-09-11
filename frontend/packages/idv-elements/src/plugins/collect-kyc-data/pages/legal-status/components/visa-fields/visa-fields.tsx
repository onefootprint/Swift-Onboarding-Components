import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { VisaKind } from '@onefootprint/types';
import { Select, TextInput } from '@onefootprint/ui';
import { isValid } from 'date-fns';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { FormData } from '../../types';

const VisaFields = () => {
  const { t } = useTranslation('pages.legal-status.form');
  const {
    control,
    formState: { errors },
    register,
    getValues,
  } = useFormContext<FormData>();
  const inputMasks = useInputMask('en-US');

  const errorType = errors.visa?.expirationDate?.type;
  const errorMessage = errorType ? t(`visa-expiration.error.${errorType}`) : '';

  const options = Object.keys(VisaKind)
    .filter(el => Number.isNaN(Number(el)))
    .map(key => ({
      label: t(`visa-kind.mapping.${key}`),
      value: key,
    }));

  return (
    <>
      <Controller
        data-private
        control={control}
        name="visa.kind"
        rules={{ required: true }}
        render={({ field, fieldState: { error } }) => (
          <Select
            data-private
            label={t('visa-kind.label')}
            onBlur={field.onBlur}
            options={options}
            onChange={field.onChange}
            hint={error && t('visa-kind.error')}
            hasError={!!error}
            placeholder={t('visa-kind.placeholder')}
            value={field.value}
            testID="visa-kind-select"
          />
        )}
      />
      <TextInput
        data-private
        hasError={!!errorMessage}
        hint={errorMessage}
        label={t('visa-expiration.label')}
        mask={inputMasks.visaExpiration}
        placeholder={t('visa-expiration.placeholder')}
        value={getValues('visa.expirationDate')}
        {...register('visa.expirationDate', {
          required: true,
          validate: {
            invalid: input => input && isValid(new Date(input)),
            invalidTimeframe: input =>
              input &&
              new Date(input).getFullYear() > 1900 &&
              new Date(input).getFullYear() < 3000,
          },
        })}
        testID="visa-expiration-textinput"
      />
    </>
  );
};

export default VisaFields;
