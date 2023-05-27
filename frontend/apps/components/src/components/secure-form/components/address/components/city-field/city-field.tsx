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
  const { t } = useTranslation('components.secure-form.address.form.city');

  return (
    <TextInput
      data-private
      autoComplete="address-level2"
      disabled={disabled}
      hasError={!!errors.city}
      hint={errors.city && t('error')}
      label={t('label')}
      placeholder={t('placeholder')}
      {...register('city', { required: true })}
    />
  );
};

export default CityField;
