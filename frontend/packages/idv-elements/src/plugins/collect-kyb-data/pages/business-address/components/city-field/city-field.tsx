import { useTranslation } from '@onefootprint/hooks';
import { BusinessDataAttribute } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

const CityField = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation('pages.business-address.form.city');

  return (
    <TextInput
      data-private
      autoComplete="address-level2"
      hasError={!!errors[BusinessDataAttribute.city]}
      hint={errors[BusinessDataAttribute.city] && t('error')}
      label={t('label')}
      placeholder={t('placeholder')}
      {...register(BusinessDataAttribute.city, { required: true })}
    />
  );
};

export default CityField;
