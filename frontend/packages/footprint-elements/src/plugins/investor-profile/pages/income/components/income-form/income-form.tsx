import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button/continue-button';
import { IncomeData } from '../../../../utils/state-machine/types';

export type IncomeFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    InvestorProfileDataAttribute.annualIncome
  >;
  isLoading?: boolean;
  onSubmit: (data: IncomeData) => void;
};

const IncomeForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: IncomeFormProps) => {
  const { handleSubmit } = useForm<IncomeData>({
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

export default IncomeForm;
