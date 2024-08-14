import type { SupportedLocale } from '@onefootprint/footprint-js';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { PhoneInput } from '@onefootprint/ui';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import checkIsPhoneValid from '../../../../../../../../../../utils/check-is-phone-valid/check-is-phone-valid';
import type { FormData } from '../../../../types';

type PhoneProps = {
  index: number;
  config?: PublicOnboardingConfig;
  locale?: SupportedLocale;
  requireMultiKyc?: boolean;
};

const PhoneFieldName = BeneficialOwnerDataAttribute.phoneNumber;

const Phone = ({ index, config, locale, requireMultiKyc }: PhoneProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.beneficial-owners.form.fields.phone',
  });
  const {
    control,
    formState: { errors },
  } = useFormContext<FormData>();

  const shouldHide = index === 0 || !requireMultiKyc;
  const phoneErrors = errors.beneficialOwners?.[index]?.[PhoneFieldName];

  return shouldHide ? null : (
    <Controller
      control={control}
      name={`beneficialOwners.${index}.${PhoneFieldName}`}
      rules={{
        required: {
          value: true,
          message: t('errors.required'),
        },
        validate: value => {
          const isInvalid = value && !checkIsPhoneValid(value, !config?.isLive);
          return isInvalid ? t('errors.invalid') : undefined;
        },
      }}
      render={({ field: { onChange, onBlur, value, name }, fieldState: { error } }) => (
        <PhoneInput
          data-dd-privacy="mask"
          data-dd-action-name="Phone input"
          hasError={!!error}
          hint={error ? phoneErrors?.message : undefined}
          label={t('label')}
          name={name}
          onBlur={onBlur}
          onChange={onChange}
          value={value}
          locale={locale}
        />
      )}
    />
  );
};

export default Phone;
