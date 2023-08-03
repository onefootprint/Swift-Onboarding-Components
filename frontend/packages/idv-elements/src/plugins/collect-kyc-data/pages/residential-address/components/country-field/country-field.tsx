import { useTranslation } from '@onefootprint/hooks';
import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type CountryFieldProps = {
  onChange: () => void;
  disabled?: boolean;
};

const CountryField = ({ onChange, disabled }: CountryFieldProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation('pages.residential-address.form.country');

  return (
    <Controller
      data-private
      control={control}
      name="country"
      render={({ field }) => (
        <CountrySelect
          label={t('label')}
          disabled={disabled}
          onBlur={field.onBlur}
          onChange={nextValue => {
            field.onChange(nextValue);
            onChange();
          }}
          placeholder={t('placeholder')}
          value={field.value}
          hint={t('disabled-hint')}
        />
      )}
    />
  );
};

export default CountryField;
