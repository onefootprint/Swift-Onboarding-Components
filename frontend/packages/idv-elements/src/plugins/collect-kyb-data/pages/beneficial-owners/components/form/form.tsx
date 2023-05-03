import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import {
  BeneficialOwner,
  BeneficialOwnerDataAttribute,
} from '@onefootprint/types';
import { Button, Divider, Typography, useToast } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import AddButton from './components/add-button';
import FormInvalidError from './components/error';
import Fields from './components/fields';
import { FormData } from './types';

export type FormProps = {
  defaultValues?: BeneficialOwner[];
  isLoading: boolean;
  onSubmit: (data: BeneficialOwner[]) => void;
  ctaLabel?: string;
  requireMultiKyc?: boolean;
};

const Form = ({
  defaultValues,
  isLoading,
  onSubmit,
  ctaLabel,
  requireMultiKyc,
}: FormProps) => {
  const [animate] = useAutoAnimate<HTMLFormElement>();
  const { t, allT } = useTranslation('pages.beneficial-owners.form');
  const toast = useToast();
  const defaultBeneficialOwnersData = defaultValues ?? [
    {
      [BeneficialOwnerDataAttribute.firstName]: '',
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
          bo[BeneficialOwnerDataAttribute.ownershipStake] >= 25 &&
          // Only require email/phone for additional BOs
          (index === 0 ||
            !!bo[BeneficialOwnerDataAttribute.email] ||
            !!bo[BeneficialOwnerDataAttribute.phoneNumber]),
      )
      .map(bo => ({
        ...bo,
        // Parse ownership stake from string to number
        [BeneficialOwnerDataAttribute.ownershipStake]: Number(
          bo[BeneficialOwnerDataAttribute.ownershipStake],
        ),
      }));

    onSubmit(beneficialOwners);
  };

  return (
    <FormProvider {...methods}>
      <StyledForm onSubmit={handleSubmit(onSubmitFormData)} ref={animate}>
        {fields.map((field, index) => (
          <React.Fragment key={field.id}>
            <Fields index={index} onRemove={removeIndex} />
            {index === 0 && fields.length > 1 && <Divider />}
          </React.Fragment>
        ))}
        {shouldShowMultiKyc && (
          <Typography variant="body-3" color="secondary">
            {t('multi-kyc')}
          </Typography>
        )}
        <Divider />
        <AddButton onClick={handleAddMore} />
        {shouldShowError && <FormInvalidError />}
        <Button type="submit" fullWidth loading={isLoading}>
          {ctaLabel ?? allT('pages.cta-continue')}
        </Button>
      </StyledForm>
    </FormProvider>
  );
};

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[6]};
  `}
`;

export default Form;
