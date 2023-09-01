import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import useInputValidations from '../../hooks/use-input-validations';
import { FormData } from '../../types';

const ZipField = () => {
  const {
    register,
    formState: { errors },
    getValues,
    watch,
  } = useFormContext<FormData>();
  const { t } = useTranslation('pages.residential-address.form.zipCode');
  const country = watch('country');
  const { zipcode } = useInputValidations(country.value);
  const isDomestic = country.value === 'US';

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
        required: isDomestic,
        pattern: zipcode.pattern,
      })}
    />
  );
};

export default ZipField;
