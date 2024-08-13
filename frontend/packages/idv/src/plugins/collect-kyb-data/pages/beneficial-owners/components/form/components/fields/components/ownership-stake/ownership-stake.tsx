import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { FormData } from '../../../../types';

type OwnershipStakeProps = {
  index: number;
};

const OwnershipStake = ({ index }: OwnershipStakeProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.beneficial-owners.form.fields.ownership-stake',
  });
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();

  const ownershipStakeErrors = errors.beneficialOwners?.[index]?.[BeneficialOwnerDataAttribute.ownershipStake];
  const hasError = !!ownershipStakeErrors;
  const hint = hasError ? ownershipStakeErrors?.message : undefined;

  return (
    <TextInput
      type="number"
      data-dd-privacy="mask"
      data-dd-action-name="Ownership stake input"
      hasError={hasError}
      hint={hint}
      label={t('label')}
      placeholder={t('placeholder')}
      {...register(`beneficialOwners.${index}.${BeneficialOwnerDataAttribute.ownershipStake}`, {
        required: {
          value: true,
          message: t('errors.required'),
        },
        min: {
          value: 1,
          message: t('errors.min'),
        },
        max: {
          value: 100,
          message: t('errors.max'),
        },
      })}
    />
  );
};

export default OwnershipStake;
