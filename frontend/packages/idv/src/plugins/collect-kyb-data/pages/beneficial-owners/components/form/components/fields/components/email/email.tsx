import { isEmail } from '@onefootprint/core';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { FormData } from '../../../../types';

type EmailProps = {
  index: number;
  requireMultiKyc?: boolean;
};

const Email = ({ index, requireMultiKyc }: EmailProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.beneficial-owners.form.fields.email',
  });
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();

  const emailErrors = errors.beneficialOwners?.[index]?.[BeneficialOwnerDataAttribute.email];
  const hasError = !!emailErrors;
  const hint = hasError ? emailErrors?.message : undefined;
  const shouldHide = index === 0 || !requireMultiKyc;

  return shouldHide ? null : (
    <TextInput
      data-dd-action-name="Email input"
      data-dd-privacy="mask"
      hasError={hasError}
      hint={hint}
      label={t('label')}
      placeholder={t('placeholder')}
      type="email"
      {...register(`beneficialOwners.${index}.${BeneficialOwnerDataAttribute.email}`, {
        required: {
          value: true,
          message: t('errors.required'),
        },
        validate: (value: string) => {
          if (!isEmail(value)) {
            return t('errors.invalid');
          }
          return true;
        },
      })}
    />
  );
};

export default Email;
