import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { NameInformation } from '../../../../utils/data-types';
import CtaButton from '../cta-button';
import NameFields from '../name-fields';

type FormData = NameInformation;

type NameFormProps = {
  isLoading: boolean;
  onSubmit: (data: NameInformation) => void;
  ctaLabel?: string;
};

const NameForm = ({ isLoading, ctaLabel, onSubmit }: NameFormProps) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;

  const methods = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.firstName]: data[UserDataAttribute.firstName],
      [UserDataAttribute.lastName]: data[UserDataAttribute.lastName],
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicInformation = {
      [UserDataAttribute.firstName]: formData[UserDataAttribute.firstName],
      [UserDataAttribute.lastName]: formData[UserDataAttribute.lastName],
    };
    onSubmit(basicInformation);
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmitFormData)}>
        <NameFields />
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
