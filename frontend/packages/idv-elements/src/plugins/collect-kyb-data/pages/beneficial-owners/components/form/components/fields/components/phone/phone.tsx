import type { SupportedLocale } from '@onefootprint/footprint-js';
import { useTranslation } from '@onefootprint/hooks';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { PhoneInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import checkIsPhoneValid from '../../../../../../../../../../utils/check-is-phone-valid/check-is-phone-valid';
import type { FormData } from '../../../../types';

type PhoneProps = {
  index: number;
  config?: PublicOnboardingConfig;
  locale?: SupportedLocale;
};

const PhoneFieldName = BeneficialOwnerDataAttribute.phoneNumber;

const Phone = ({ index, config, locale }: PhoneProps) => {
  const { t } = useTranslation('kyb.pages.beneficial-owners.form.fields.phone');
  const {
    control,
    formState: { errors },
  } = useFormContext<FormData>();

  const shouldHide = index === 0;
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
          return isInvalid ? t('errors.pattern') : undefined;
        },
      }}
      render={({
        field: { onChange, onBlur, value, name },
        fieldState: { error },
      }) => (
        <PhoneInput
          data-private
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
