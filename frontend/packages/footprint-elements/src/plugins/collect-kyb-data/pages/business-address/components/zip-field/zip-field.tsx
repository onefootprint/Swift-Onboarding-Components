import { useTranslation } from '@onefootprint/hooks';
import type { CountryCode } from '@onefootprint/types';
import { UserDataAttribute } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import useInputValidations from '../../hooks/use-input-validations';

type ZipFieldProps = {
  countryCode: CountryCode;
};

const ZipField = ({ countryCode }: ZipFieldProps) => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();
  const { t } = useTranslation('pages.business-address.form.zip');
  const { zip } = useInputValidations(countryCode);

  return (
    <TextInput
      data-private
      autoComplete="postal-code"
      hasError={!!errors[UserDataAttribute.zip]}
      hint={errors[UserDataAttribute.zip] && t('error')}
      label={t('label')}
      mask={zip.mask}
      maxLength={zip.maxLength}
      minLength={zip.minLength}
      placeholder={t('placeholder')}
      value={getValues(UserDataAttribute.zip)}
      {...register(UserDataAttribute.zip, {
        required: true,
        pattern: zip.pattern,
      })}
    />
  );
};

export default ZipField;
