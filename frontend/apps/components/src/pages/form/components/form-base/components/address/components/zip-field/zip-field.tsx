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
  const { t } = useTranslation('pages.secure-form.address.form.zip');
  const { zipcode } = useInputValidations(countryCode);
  const isDomestic = countryCode === 'US';

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
        validate: isDomestic
          ? (value: string) =>
              zipcode.pattern ? zipcode.pattern.test(value) : undefined
          : undefined,
      })}
    />
  );
};

export default ZipField;
