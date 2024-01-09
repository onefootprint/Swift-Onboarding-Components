import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

const CityField = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation('kyb.pages.business-address.form.city');

  return (
    <TextInput
      data-private
      autoComplete="address-level2"
      hasError={!!errors.city}
      hint={errors.city && t('error')}
      label={t('label')}
      placeholder={t('placeholder')}
      {...register('city', { required: true })}
    />
  );
};

export default CityField;
