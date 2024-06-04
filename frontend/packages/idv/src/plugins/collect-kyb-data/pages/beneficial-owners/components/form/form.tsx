import type {
  BeneficialOwner,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { Divider, Grid, Text, useToast } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import EditableFormButtonContainer from '../../../../../../components/editable-form-button-container';
import { useL10nContext } from '../../../../../../components/l10n-provider';
import AddButton from './components/add-button';
import FormInvalidError from './components/error';
import Fields from './components/fields';
import type { FormData } from './types';

export type FormProps = {
  defaultValues?: BeneficialOwner[];
  isLoading: boolean;
  onSubmit: (data: BeneficialOwner[]) => void;
  onCancel?: () => void;
  ctaLabel?: string;
  requireMultiKyc?: boolean;
  config?: PublicOnboardingConfig;
};

const Form = ({
  defaultValues,
  isLoading,
  onSubmit,
  onCancel,
  ctaLabel,
  requireMultiKyc,
  config,
}: FormProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.beneficial-owners.form',
  });
  const toast = useToast();
  const l10n = useL10nContext();
  const defaultBeneficialOwnersData = defaultValues ?? [
    {
      [BeneficialOwnerDataAttribute.firstName]: '',
      [BeneficialOwnerDataAttribute.middleName]: '',
      [BeneficialOwnerDataAttribute.lastName]: '',
      [BeneficialOwnerDataAttribute.email]: '',
      [BeneficialOwnerDataAttribute.phoneNumber]: '',
      [BeneficialOwnerDataAttribute.ownershipStake]: 0,
    },
  ];
  const methods = useForm<FormData>({
    defaultValues: {
      beneficialOwners: [...defaultBeneficialOwnersData],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'beneficialOwners',
    rules: { minLength: 1 },
  });
  const shouldShowError =
    !!errors?.beneficialOwners && errors?.beneficialOwners?.[0];
  const shouldShowMultiKyc = requireMultiKyc && fields.length > 1;

  const handleAddMore = () => {
    append({
      [BeneficialOwnerDataAttribute.firstName]: '',
      [BeneficialOwnerDataAttribute.middleName]: '',
      [BeneficialOwnerDataAttribute.lastName]: '',
      [BeneficialOwnerDataAttribute.email]: '',
      [BeneficialOwnerDataAttribute.phoneNumber]: '',
      [BeneficialOwnerDataAttribute.ownershipStake]: 0,
    });
  };

  const removeIndex = (index: number) => {
    remove(index);
  };

  const onSubmitFormData = (formData: FormData) => {
    const totalOwnershipStake = formData.beneficialOwners
      .map(bo => Number(bo[BeneficialOwnerDataAttribute.ownershipStake]))
      .reduce((acc, curr) => acc + curr, 0);

    if (totalOwnershipStake > 100) {
      toast.show({
        title: t('errors.ownership-stake-total.title'),
        description: t('errors.ownership-stake-total.description'),
        variant: 'error',
      });

      return;
    }

    const beneficialOwners = formData.beneficialOwners
      .filter(
        (bo, index) =>
          bo[BeneficialOwnerDataAttribute.firstName] &&
          bo[BeneficialOwnerDataAttribute.lastName] &&
          bo[BeneficialOwnerDataAttribute.ownershipStake] > 0 &&
          // Only require email/phone for additional BOs and if we are collecting business_kyced_benficial_owners
          (index === 0 ||
            !requireMultiKyc ||
            !!bo[BeneficialOwnerDataAttribute.email] ||
            !!bo[BeneficialOwnerDataAttribute.phoneNumber]),
      )
      .map(bo => ({
        ...bo,
        // Send undefined instead of empty string for unknown middle name
        [BeneficialOwnerDataAttribute.middleName]:
          bo[BeneficialOwnerDataAttribute.middleName] || undefined,
        // Send undefined instead of empty string for unknown phone/email. The primary BO is allowed
        // to have no phone / email
        [BeneficialOwnerDataAttribute.phoneNumber]:
          bo[BeneficialOwnerDataAttribute.phoneNumber] || undefined,
        [BeneficialOwnerDataAttribute.email]:
          bo[BeneficialOwnerDataAttribute.email] || undefined,
        // Parse ownership stake from string to number
        [BeneficialOwnerDataAttribute.ownershipStake]: Number(
          bo[BeneficialOwnerDataAttribute.ownershipStake],
        ),
      }));

    onSubmit(beneficialOwners);
  };

  return (
    <FormProvider {...methods}>
      <Grid.Container
        tag="form"
        gap={6}
        width="100%"
        onSubmit={handleSubmit(onSubmitFormData)}
      >
        {fields.map((field, index) => (
          <React.Fragment key={field.id}>
            <Fields
              index={index}
              onRemove={removeIndex}
              config={config}
              l10n={l10n}
              requiresMultiKyc={requireMultiKyc}
            />
            {index === 0 && fields.length > 1 && <Divider />}
          </React.Fragment>
        ))}
        {shouldShowMultiKyc && (
          <Text variant="body-3" color="secondary">
            {t('multi-kyc')}
          </Text>
        )}
        <Divider />
        <AddButton onClick={handleAddMore} />
        {shouldShowError && <FormInvalidError />}
        <EditableFormButtonContainer
          onCancel={onCancel}
          isLoading={isLoading}
          ctaLabel={ctaLabel}
        />
      </Grid.Container>
    </FormProvider>
  );
};

export default Form;
