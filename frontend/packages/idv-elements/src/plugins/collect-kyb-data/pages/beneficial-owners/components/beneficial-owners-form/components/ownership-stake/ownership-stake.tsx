import { useTranslation } from '@onefootprint/hooks';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { FormData } from '../../types';

type OwnershipStakeProps = {
  index: number;
};

const OwnershipStake = ({ index }: OwnershipStakeProps) => {
  const { t } = useTranslation(
    'pages.beneficial-owners.form.fields.ownership-stake',
  );
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();

  const ownershipStakeErrors =
    errors.beneficialOwners?.[index]?.[
      BeneficialOwnerDataAttribute.ownershipStake
    ];
  const hasError = !!ownershipStakeErrors;
  const hint = hasError ? ownershipStakeErrors?.message : undefined;

  return (
    <TextInput
      type="number"
      data-private
      hasError={hasError}
      hint={hint}
      label={t('label')}
      placeholder={t('placeholder')}
      {...register(
        `beneficialOwners.${index}.${BeneficialOwnerDataAttribute.ownershipStake}`,
        {
          required: {
            value: true,
            message: t('errors.required'),
          },
          min: {
            value: 25,
            message: t('errors.min'),
          },
          max: {
            value: 100,
            message: t('errors.max'),
          },
        },
      )}
    />
  );
};

export default OwnershipStake;
