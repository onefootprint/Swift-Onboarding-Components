import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useCollectKycDataMachine, {
  MachineContext,
} from '../../../../hooks/use-collect-kyc-data-machine';
import { DobInformation } from '../../../../utils/data-types';
import CtaButton from '../cta-button';
import DobField from '../dob-field';

type FormData = DobInformation;

type DobFormProps = {
  isLoading: boolean;
  onSubmit: (data: DobInformation) => void;
  ctaLabel?: string;
};

const DobForm = ({ isLoading, onSubmit, ctaLabel }: DobFormProps) => {
  const [state] = useCollectKycDataMachine();
  const { data }: MachineContext = state.context;

  const methods = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.dob]: data[UserDataAttribute.dob],
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicInformation = {
      [UserDataAttribute.dob]: formData[UserDataAttribute.dob],
    };
    onSubmit(basicInformation);
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmitFormData)}>
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
export default DobForm;
