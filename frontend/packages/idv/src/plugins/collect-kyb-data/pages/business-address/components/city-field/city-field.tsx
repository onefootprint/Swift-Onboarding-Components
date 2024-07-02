import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const CityField = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.business-address.form.city',
  });

  return (
    <TextInput
      data-dd-privacy="mask"
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
