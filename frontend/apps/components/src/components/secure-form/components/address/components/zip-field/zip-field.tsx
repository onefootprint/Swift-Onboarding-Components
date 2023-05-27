import { useTranslation } from '@onefootprint/hooks';
import type { CountryCode } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import useInputValidations from './hooks/use-input-validations';

type ZipFieldProps = {
  countryCode: CountryCode;
};

const ZipField = ({ countryCode }: ZipFieldProps) => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();
  const { t } = useTranslation('components.secure-form.address.form.zip');
  const { zipcode } = useInputValidations(countryCode);

  return (
    <TextInput
      data-private
      autoComplete="postal-code"
      hasError={!!errors.zip}
      hint={errors.zip && t('error')}
      label={t('label')}
      mask={zipcode.mask}
      maxLength={zipcode.maxLength}
      minLength={zipcode.minLength}
      placeholder={t('placeholder')}
      value={getValues('zip')}
      {...register('zip', {
        required: true,
        pattern: zipcode.pattern,
      })}
    />
  );
};

export default ZipField;
