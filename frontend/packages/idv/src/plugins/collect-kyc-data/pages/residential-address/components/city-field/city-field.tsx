import { TextInput } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { FormData } from '../../types';

const CityField = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.pages.residential-address.form.city',
  });

  return (
    <TextInput
      autoComplete="address-level2"
      data-nid-target="city"
      data-dd-privacy="mask"
      hasError={!!errors.city}
      hint={errors.city && t('error')}
      label={t('label')}
      placeholder={t('placeholder')}
      {...register('city', { required: true })}
    />
  );
};

export default CityField;
