import type { CountryCode } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form.address.form.zip',
  });
  const { zipcode } = useInputValidations(countryCode);
  const isCountryUS = countryCode === 'US';

  return (
    <TextInput
      data-dd-privacy="mask"
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
        validate: isCountryUS
          ? (value: string) => (zipcode.pattern ? zipcode.pattern.test(value) : undefined)
          : undefined,
      })}
    />
  );
};

export default ZipField;
