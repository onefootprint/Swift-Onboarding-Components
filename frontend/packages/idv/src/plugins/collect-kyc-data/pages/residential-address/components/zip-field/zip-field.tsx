import { TextInput } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import useInputValidations from '../../hooks/use-input-validations';
import type { FormData } from '../../types';

const ZipField = () => {
  const {
    register,
    formState: { errors },
    watch,
    getValues,
  } = useFormContext<FormData>();
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.pages.residential-address.form.zipCode',
  });
  const country = watch('country');
  const { zipcode } = useInputValidations(country.value);
  const isCountryUs = country.value === 'US';

  return (
    <TextInput
      autoComplete="postal-code"
      data-nid-target="zip"
      data-dd-privacy="mask"
      defaultValue={getValues('zip')}
      hasError={!!errors.zip}
      hint={errors.zip && t('error')}
      label={t('label')}
      placeholder={t('placeholder')}
      {...register('zip', {
        required: isCountryUs,
        validate: isCountryUs
          ? (value: string) => (zipcode.pattern ? zipcode.pattern.test(value) : undefined)
          : undefined,
      })}
    />
  );
};

export default ZipField;
