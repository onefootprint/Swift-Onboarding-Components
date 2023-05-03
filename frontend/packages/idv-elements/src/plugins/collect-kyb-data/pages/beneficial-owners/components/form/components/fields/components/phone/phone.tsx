import { useTranslation } from '@onefootprint/hooks';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { PhoneInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { FormData } from '../../../../types';
import PHONE_REGEX from './constants';

type PhoneProps = {
  index: number;
};

const Phone = ({ index }: PhoneProps) => {
  const { t } = useTranslation('pages.beneficial-owners.form.fields.phone');
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();

  const phoneErrors =
    errors.beneficialOwners?.[index]?.[
      BeneficialOwnerDataAttribute.phoneNumber
    ];
  const hasError = !!phoneErrors;
  const hint = hasError ? phoneErrors?.message : undefined;
  const shouldHide = index === 0;

  return shouldHide ? null : (
    <PhoneInput
      data-private
      hasError={hasError}
      hint={hint}
      label={t('label')}
      placeholder={t('placeholder')}
      {...register(
        `beneficialOwners.${index}.${BeneficialOwnerDataAttribute.phoneNumber}`,
        {
          required: {
            value: true,
            message: t('errors.required'),
          },
          pattern: {
            value: PHONE_REGEX,
            message: t('errors.pattern'),
          },
        },
      )}
    />
  );
};

export default Phone;
