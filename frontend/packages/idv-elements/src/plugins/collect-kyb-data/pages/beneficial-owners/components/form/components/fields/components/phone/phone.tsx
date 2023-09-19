import { useTranslation } from '@onefootprint/hooks';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { PhoneInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import checkIsPhoneValid from '../../../../../../../../../../services/identify/pages/phone-identification/components/form/utils/check-is-phone-valid/check-is-phone-valid';
import type { FormData } from '../../../../types';

type PhoneProps = { index: number };

const PhoneFieldName = BeneficialOwnerDataAttribute.phoneNumber;

const Phone = ({ index }: PhoneProps) => {
  const { t } = useTranslation('pages.beneficial-owners.form.fields.phone');
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
        validate: value =>
          (value && !checkIsPhoneValid(value, false)) || t('errors.pattern'),
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
        />
      )}
    />
  );
};

export default Phone;
