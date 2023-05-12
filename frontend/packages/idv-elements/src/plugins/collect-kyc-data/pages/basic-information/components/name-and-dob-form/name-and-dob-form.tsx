import { IdDI } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { KycData } from '../../../../utils/data-types';
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
  onSubmit: (data: KycData) => void;
  ctaLabel?: string;
};

const NameAndDobForm = ({
  isLoading,
  onSubmit,
  ctaLabel,
}: NameAndDobFormProps) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const hasFixedName =
    data?.[IdDI.firstName]?.fixed && data?.[IdDI.lastName]?.fixed;

  const methods = useForm<FormData>({
    defaultValues: {
      firstName: data[IdDI.firstName]?.value,
      lastName: data[IdDI.lastName]?.value,
      dob: data[IdDI.dob]?.value,
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicInformation = {
      [IdDI.firstName]: { value: formData.firstName, fixed: hasFixedName },
      [IdDI.lastName]: { value: formData.lastName, fixed: hasFixedName },
      [IdDI.dob]: { value: formData.dob },
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
