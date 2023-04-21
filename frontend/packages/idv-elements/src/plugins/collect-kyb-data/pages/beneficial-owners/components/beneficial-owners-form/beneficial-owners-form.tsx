import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import {
  BeneficialOwnerDataAttribute,
  BusinessData,
  BusinessDataAttribute,
} from '@onefootprint/types';
import { Button, Divider, useToast } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import { BeneficialOwnersData } from '../../../../utils/state-machine/types';
import AddButton from './components/add-button';
import BeneficialOwnerFields from './components/beneficial-owner-fields';
import FormInvalidError from './components/form-invalid-error';

type FormData = BeneficialOwnersData;

export type BeneficialOwnersFormProps = {
  defaultValues?: Pick<BusinessData, BusinessDataAttribute.beneficialOwners>;
  isLoading: boolean;
  onSubmit: (data: BeneficialOwnersData) => void;
  ctaLabel?: string;
};

const BeneficialOwnersForm = ({
  defaultValues,
  isLoading,
  onSubmit,
  ctaLabel,
}: BeneficialOwnersFormProps) => {
  const [animate] = useAutoAnimate<HTMLFormElement>();
  const { t, allT } = useTranslation('pages.beneficial-owners.form');
  const toast = useToast();
  const defaultBeneficialOwnersData = defaultValues?.[
    BusinessDataAttribute.beneficialOwners
  ] ?? [
    {
      [BeneficialOwnerDataAttribute.firstName]: '',
      [BeneficialOwnerDataAttribute.lastName]: '',
      [BeneficialOwnerDataAttribute.email]: undefined,
      [BeneficialOwnerDataAttribute.ownershipStake]: 0,
    },
  ];

  const methods = useForm<FormData>({
    defaultValues: {
      [BusinessDataAttribute.beneficialOwners]: [
        ...defaultBeneficialOwnersData,
      ],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: BusinessDataAttribute.beneficialOwners,
    rules: { minLength: 1 },
  });
  const shouldShowError =
    !!errors?.[BusinessDataAttribute.beneficialOwners] &&
    errors?.[BusinessDataAttribute.beneficialOwners]?.[0];

  const handleAddMore = () => {
    append({
      [BeneficialOwnerDataAttribute.firstName]: '',
      [BeneficialOwnerDataAttribute.lastName]: '',
      [BeneficialOwnerDataAttribute.email]: undefined,
      [BeneficialOwnerDataAttribute.ownershipStake]: 0,
    });
  };

  const removeIndex = (index: number) => {
    remove(index);
  };

  const onSubmitFormData = (formData: FormData) => {
    const totalOwnershipStake = formData[BusinessDataAttribute.beneficialOwners]
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

    const beneficialOwners = formData[BusinessDataAttribute.beneficialOwners]
      .filter(
        (bo, index) =>
          bo[BeneficialOwnerDataAttribute.firstName] &&
          bo[BeneficialOwnerDataAttribute.lastName] &&
          bo[BeneficialOwnerDataAttribute.ownershipStake] >= 25 &&
          // Only require email for additional BOs
          (index === 0 || !!bo[BeneficialOwnerDataAttribute.email]),
      )
      .map(bo => ({
        ...bo,
        // Parse ownership stake from string to number
        [BeneficialOwnerDataAttribute.ownershipStake]: Number(
          bo[BeneficialOwnerDataAttribute.ownershipStake],
        ),
      }));
    onSubmit({ [BusinessDataAttribute.beneficialOwners]: beneficialOwners });
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmitFormData)} ref={animate}>
        {fields.map((field, index) => (
          <React.Fragment key={field.id}>
            <BeneficialOwnerFields index={index} onRemove={removeIndex} />
            <Divider />
          </React.Fragment>
        ))}
        <AddButton onClick={handleAddMore} />
        {shouldShowError && <FormInvalidError />}
        <Button type="submit" fullWidth loading={isLoading}>
          {ctaLabel ?? allT('pages.cta-continue')}
        </Button>
      </Form>
    </FormProvider>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[6]};
  `}
`;

export default BeneficialOwnersForm;
