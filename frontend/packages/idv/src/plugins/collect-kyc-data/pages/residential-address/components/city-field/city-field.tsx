import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { FormData } from '../../types';

const CityField = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();
  const { t } = useTranslation('kyc.pages.residential-address.form.city');

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
