import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { Button, Divider } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import { BeneficialOwnersData } from '../../../../utils/state-machine/types';
import AddButton from './components/add-button';
import BeneficialOwnerFields from './components/beneficial-owner-fields';
import FormInvalidError from './components/form-invalid-error';

type FormData = BeneficialOwnersData;

type BeneficialOwnersFormProps = {
  isLoading: boolean;
  onSubmit: (data: BeneficialOwnersData) => void;
  ctaLabel?: string;
};

const BeneficialOwnersForm = ({
  isLoading,
  onSubmit,
  ctaLabel,
}: BeneficialOwnersFormProps) => {
  const [state] = useCollectKybDataMachine();
  const [animate] = useAutoAnimate<HTMLFormElement>();
  const {
    data: { beneficialOwners: beneficialOwnersDefaultData },
  } = state.context;
  const { allT } = useTranslation('pages.beneficial-owners.form');
  const defaultValues = beneficialOwnersDefaultData
    ? [...beneficialOwnersDefaultData]
    : [
        {
          [BeneficialOwnerDataAttribute.firstName]: '',
          [BeneficialOwnerDataAttribute.lastName]: '',
          [BeneficialOwnerDataAttribute.email]: undefined,
          [BeneficialOwnerDataAttribute.ownershipStake]: 0,
        },
      ];
  const methods = useForm<FormData>({
    defaultValues: { beneficialOwners: defaultValues },
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
    !!errors.beneficialOwners && errors.beneficialOwners[0];

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
    const beneficialOwners = formData.beneficialOwners.filter(
      (bo, index) =>
        bo[BeneficialOwnerDataAttribute.firstName] &&
        bo[BeneficialOwnerDataAttribute.lastName] &&
        bo[BeneficialOwnerDataAttribute.ownershipStake] >= 25 &&
        // Only require email for additional BOs
        (index === 0 || !!bo[BeneficialOwnerDataAttribute.email]),
    );
    onSubmit({ beneficialOwners });
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmitFormData)} ref={animate}>
        {fields.map((field, index) => (
          <>
            <BeneficialOwnerFields
              index={index}
              key={field.id}
              onRemove={removeIndex}
            />
            <Divider key={`divider-${field.id}`} />
          </>
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
