import { useTranslation } from '@onefootprint/hooks';
import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type CountryFieldProps = {
  onChange: () => void;
};

const CountryField = ({ onChange }: CountryFieldProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation('pages.business-address.form.country');

  return (
    <Controller
      data-private
      control={control}
      name="country"
      render={({ field }) => (
        <CountrySelect
          label={t('label')}
          onBlur={field.onBlur}
          onChange={nextValue => {
            field.onChange(nextValue);
            onChange();
          }}
          placeholder={t('placeholder')}
          value={field.value}
          // hardcode disabled until we support other countries
          disabled
          hint={t('us-only-hint')}
        />
      )}
    />
  );
};

export default CountryField;
