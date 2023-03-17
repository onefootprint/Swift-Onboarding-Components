import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button/continue-button';
import { EmploymentData } from '../../../../utils/state-machine/types';

export type EmploymentFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    | InvestorProfileDataAttribute.employmentStatus
    | InvestorProfileDataAttribute.occupation
  >;
  isLoading?: boolean;
  onSubmit: (data: EmploymentData) => void;
};

const EmploymentForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: EmploymentFormProps) => {
  const { handleSubmit } = useForm<EmploymentData>({
    defaultValues,
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* TODO: */}
      <ContinueButton isLoading={isLoading} />
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default EmploymentForm;
