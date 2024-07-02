import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type CountryFieldProps = {
  onChange: () => void;
};

const CountryField = ({ onChange }: CountryFieldProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form.address.form.country',
  });

  return (
    <Controller
      data-dd-privacy="mask"
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
        />
      )}
    />
  );
};

export default CountryField;
