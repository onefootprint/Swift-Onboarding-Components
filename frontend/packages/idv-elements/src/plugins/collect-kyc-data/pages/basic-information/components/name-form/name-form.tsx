import { IdDI } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { NameInformation } from '../../../../utils/data-types';
import CtaButton from '../cta-button';
import NameFields from '../name-fields';

type FormData = {
  firstName: string;
  lastName: string;
};

type NameFormProps = {
  isLoading: boolean;
  onSubmit: (data: NameInformation) => void;
  ctaLabel?: string;
};

const NameForm = ({ isLoading, ctaLabel, onSubmit }: NameFormProps) => {
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
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicInformation = {
      [IdDI.firstName]: formData.firstName,
      [IdDI.lastName]: formData.lastName,
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
