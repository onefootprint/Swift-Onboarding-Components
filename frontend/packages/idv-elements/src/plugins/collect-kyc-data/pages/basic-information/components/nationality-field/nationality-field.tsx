import { useTranslation } from '@onefootprint/hooks';
import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type NationalityFieldProps = {
  disabled?: boolean;
};

const NationalityField = ({ disabled }: NationalityFieldProps) => {
  const { t } = useTranslation('pages.basic-information.form.nationality');
  const { control } = useFormContext();

  return (
    <Controller
      data-private
      control={control}
      name="nationality"
      render={({ field }) => (
        <CountrySelect
          disabled={disabled}
          label={t('label')}
          onBlur={field.onBlur}
          placeholder={t('placeholder')}
          onChange={nextValue => {
            field.onChange(nextValue);
          }}
          value={field.value}
        />
      )}
    />
  );
};

export default NationalityField;
