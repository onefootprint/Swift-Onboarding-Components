import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import useInputValidations from '../../hooks/use-input-validations';
import type { FormData } from '../../types';

const ZipField = () => {
  const {
    register,
    formState: { errors },
    watch,
    getValues,
  } = useFormContext<FormData>();
  const { t } = useTranslation('pages.residential-address.form.zipCode');
  const country = watch('country');
  const { zipcode } = useInputValidations(country.value);
  const isCountryUs = country.value === 'US';

  return (
    <TextInput
      data-private
      autoComplete="postal-code"
      hasError={!!errors.zip}
      hint={errors.zip && t('error')}
      label={t('label')}
      placeholder={t('placeholder')}
      defaultValue={getValues('zip')}
      {...register('zip', {
        required: isCountryUs,
        validate: isCountryUs
          ? (value: string) =>
              zipcode.pattern ? zipcode.pattern.test(value) : undefined
          : undefined,
      })}
    />
  );
};

export default ZipField;
