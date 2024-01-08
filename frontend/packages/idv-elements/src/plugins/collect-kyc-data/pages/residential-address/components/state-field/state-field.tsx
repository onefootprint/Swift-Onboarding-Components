import {
  COUNTRIES_WITH_PROVINCES,
  COUNTRIES_WITH_STATES,
  STATES,
} from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { Select, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { FormData } from '../../types';

const StateField = () => {
  const { t } = useTranslation('pages.kyc.residential-address.form.state');
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<FormData>();
  const country = watch('country');
  const isCountryUs = country.value === 'US';

  const shouldCollect =
    COUNTRIES_WITH_STATES.includes(country.value) ||
    COUNTRIES_WITH_PROVINCES.includes(country.value);
  if (!shouldCollect) {
    return null;
  }

  return isCountryUs ? (
    <Controller
      control={control}
      name="state"
      rules={{ required: true }}
      render={({ field, fieldState: { error } }) => {
        const value = typeof field.value === 'object' ? field.value : undefined;
        return (
          <Select
            isPrivate
            label={t('label')}
            onBlur={field.onBlur}
            options={STATES}
            onChange={nextOption => {
              field.onChange(nextOption);
            }}
            hint={error && t('error')}
            hasError={!!error}
            placeholder={t('placeholder')}
            value={value}
          />
        );
      }}
    />
  ) : (
    <TextInput
      data-private
      autoComplete="address-level1"
      hasError={!!errors.state}
      hint={errors.state && t('error')}
      label={t('international-label')}
      placeholder={t('international-placeholder')}
      {...register('state')}
    />
  );
};

export default StateField;
