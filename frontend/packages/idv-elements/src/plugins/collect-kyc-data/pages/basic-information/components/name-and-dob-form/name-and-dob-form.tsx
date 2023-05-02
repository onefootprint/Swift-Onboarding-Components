import { IdDI } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { NameAndDobInformation } from '../../../../utils/data-types';
import CtaButton from '../cta-button';
import DobField from '../dob-field';
import NameFields from '../name-fields';

type FormData = {
  firstName: string;
  lastName: string;
  dob: string;
};

type NameAndDobFormProps = {
  isLoading: boolean;
  onSubmit: (data: NameAndDobInformation) => void;
  ctaLabel?: string;
};

const NameAndDobForm = ({
  isLoading,
  onSubmit,
  ctaLabel,
}: NameAndDobFormProps) => {
  const [state] = useCollectKycDataMachine();
  const { data, fixedData } = state.context;
  const hasFixedName =
    fixedData?.[IdDI.firstName] !== undefined &&
    fixedData?.[IdDI.lastName] !== undefined;

  const methods = useForm<FormData>({
    defaultValues: {
      firstName: hasFixedName
        ? fixedData?.[IdDI.firstName]
        : data[IdDI.firstName],
      lastName: hasFixedName ? fixedData?.[IdDI.lastName] : data[IdDI.lastName],
      dob: data[IdDI.dob],
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicInformation = {
      [IdDI.firstName]: formData.firstName,
      [IdDI.lastName]: formData.lastName,
      [IdDI.dob]: formData.dob,
    };
    onSubmit(basicInformation);
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmitFormData)}>
        <NameFields isDisabled={hasFixedName} />
        <DobField />
        <CtaButton isLoading={isLoading} label={ctaLabel} />
      </Form>
    </FormProvider>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default NameAndDobForm;
