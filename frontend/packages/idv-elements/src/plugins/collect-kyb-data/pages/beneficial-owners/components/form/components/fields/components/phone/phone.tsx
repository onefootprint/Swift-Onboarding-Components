import { useTranslation } from '@onefootprint/hooks';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { PhoneInput, PhoneInputRegex } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { FormData } from '../../../../types';

type PhoneProps = {
  index: number;
};

const Phone = ({ index }: PhoneProps) => {
  const { t } = useTranslation('pages.beneficial-owners.form.fields.phone');
  const {
    control,
    formState: { errors },
  } = useFormContext<FormData>();

  const phoneErrors =
    errors.beneficialOwners?.[index]?.[
      BeneficialOwnerDataAttribute.phoneNumber
    ];
  const shouldHide = index === 0;

  return shouldHide ? null : (
    <Controller
      control={control}
      name={`beneficialOwners.${index}.${BeneficialOwnerDataAttribute.phoneNumber}`}
      rules={{
        required: {
          value: true,
          message: t('errors.required'),
        },
        pattern: {
          value: PhoneInputRegex,
          message: t('errors.pattern'),
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
        />
      )}
    />
  );
};

export default Phone;
