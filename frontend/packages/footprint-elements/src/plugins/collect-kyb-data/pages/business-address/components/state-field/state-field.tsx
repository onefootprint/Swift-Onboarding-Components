import { STATES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { BusinessDataAttribute, CountryCode } from '@onefootprint/types';
import { Select, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type StateFieldProps = {
  countryCode: CountryCode;
};

const StateField = ({ countryCode }: StateFieldProps) => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();
  const { t } = useTranslation('pages.business-address.form.state');

  return countryCode === 'US' ? (
    <Controller
      control={control}
      name={BusinessDataAttribute.state}
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
      hasError={!!errors[BusinessDataAttribute.state]}
      hint={errors[BusinessDataAttribute.state] && t('form.state.error')}
      label={t('form.state.label')}
      placeholder={t('form.state.placeholder')}
      {...register(BusinessDataAttribute.state)}
    />
  );
};

export default StateField;
