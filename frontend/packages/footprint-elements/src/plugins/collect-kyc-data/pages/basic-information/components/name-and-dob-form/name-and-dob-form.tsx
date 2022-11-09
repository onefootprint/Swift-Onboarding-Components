import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { NameAndDobInformation } from '../../../../utils/data-types';
import CtaButton from '../cta-button';
import DobField from '../dob-field';
import NameFields from '../name-fields';

type FormData = NameAndDobInformation;

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
  const { data } = state.context;

  const methods = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.firstName]: data[UserDataAttribute.firstName],
      [UserDataAttribute.lastName]: data[UserDataAttribute.lastName],
      [UserDataAttribute.dob]: data[UserDataAttribute.dob],
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicInformation = {
      [UserDataAttribute.firstName]: formData[UserDataAttribute.firstName],
      [UserDataAttribute.lastName]: formData[UserDataAttribute.lastName],
      [UserDataAttribute.dob]: formData[UserDataAttribute.dob],
    };
    onSubmit(basicInformation);
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmitFormData)}>
        <NameFields />
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
