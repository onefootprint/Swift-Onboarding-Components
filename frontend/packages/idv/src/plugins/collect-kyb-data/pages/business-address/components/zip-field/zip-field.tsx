import type { CountryCode } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.business-address.form.zip',
  });
  const { zip } = useInputValidations(countryCode);

  return (
    <TextInput
      data-dd-privacy="mask"
      data-dd-action-name="Postal code input"
      autoComplete="postal-code"
      hasError={!!errors.zip}
      hint={errors.zip && t('error')}
      label={t('label')}
      mask={zip.mask}
      maxLength={zip.maxLength}
      minLength={zip.minLength}
      placeholder={t('placeholder')}
      value={getValues('zip')}
      {...register('zip', {
        required: true,
        pattern: zip.pattern,
      })}
    />
  );
};

export default ZipField;
