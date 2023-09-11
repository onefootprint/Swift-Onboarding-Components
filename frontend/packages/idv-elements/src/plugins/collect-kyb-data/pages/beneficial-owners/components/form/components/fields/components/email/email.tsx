import { useTranslation } from '@onefootprint/hooks';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { FormData } from '../../../../types';

type EmailProps = {
  index: number;
};

const Email = ({ index }: EmailProps) => {
  const { t } = useTranslation('pages.beneficial-owners.form.fields.email');
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();

  const emailErrors =
    errors.beneficialOwners?.[index]?.[BeneficialOwnerDataAttribute.email];
  const hasError = !!emailErrors;
  const hint = hasError ? emailErrors?.message : undefined;
  const shouldHide = index === 0;

  return shouldHide ? null : (
    <TextInput
      type="email"
      data-private
      label={t('label')}
      placeholder={t('placeholder')}
      hasError={hasError}
      hint={hint}
      {...register(
        `beneficialOwners.${index}.${BeneficialOwnerDataAttribute.email}`,
        {
          required: {
            value: true,
            message: t('errors.required'),
          },
        },
      )}
    />
  );
};

export default Email;
