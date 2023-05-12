import { IdDI } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { KycData } from '../../../../utils/data-types';
import CtaButton from '../cta-button';
import DobField from '../dob-field';

type FormData = {
  dob: string;
};

type DobFormProps = {
  isLoading: boolean;
  onSubmit: (data: KycData) => void;
  ctaLabel?: string;
};

const DobForm = ({ isLoading, onSubmit, ctaLabel }: DobFormProps) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;

  const methods = useForm<FormData>({
    defaultValues: {
      dob: data[IdDI.dob]?.value,
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicInformation = {
      [IdDI.dob]: { value: formData.dob },
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
