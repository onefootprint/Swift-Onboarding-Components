import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

type CityFieldProps = {
  disabled?: boolean;
};

const CityField = ({ disabled }: CityFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation('pages.residential-address.form.state');

  return (
    <TextInput
      data-private
      autoComplete="address-level2"
      disabled={disabled}
      hasError={!!errors.city}
      hint={errors.city && t('form.city.error')}
      label={t('form.city.label')}
      placeholder={t('form.city.placeholder')}
      {...register('city', { required: true })}
    />
  );
};

export default CityField;
