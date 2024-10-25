import type { CountryCode } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import getInputValidations from './input-validations';

type ZipFieldProps = {
  countryCode: CountryCode;
};

const ZipField = ({ countryCode }: ZipFieldProps) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();
  const { t } = useTranslation('common', { keyPrefix: 'pages.secure-form.address.form.zip' });
  const { zipcode } = getInputValidations(countryCode);

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
      value={watch('zip')}
      {...register('zip', {
        required: true,
        pattern: zipcode.pattern,
      })}
    />
  );
};

export default ZipField;
