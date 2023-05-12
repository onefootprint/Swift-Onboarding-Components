import { IdDI } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { KycData } from '../../../../utils/data-types';
import CtaButton from '../cta-button';
import NameFields from '../name-fields';

type FormData = {
  firstName: string;
  lastName: string;
};

type NameFormProps = {
  isLoading: boolean;
  onSubmit: (data: KycData) => void;
  ctaLabel?: string;
};

const NameForm = ({ isLoading, ctaLabel, onSubmit }: NameFormProps) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const hasFixedName =
    data?.[IdDI.firstName]?.fixed && data?.[IdDI.lastName]?.fixed;

  const methods = useForm<FormData>({
    defaultValues: {
      firstName: data[IdDI.firstName]?.value,
      lastName: data[IdDI.lastName]?.value,
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicInformation = {
      [IdDI.firstName]: { value: formData.firstName, fixed: hasFixedName },
      [IdDI.lastName]: { value: formData.lastName, fixed: hasFixedName },
    };
    onSubmit(basicInformation);
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmitFormData)}>
        <NameFields isDisabled={hasFixedName} />
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

export default NameForm;
