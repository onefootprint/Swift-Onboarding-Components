import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button/continue-button';
import { InvestmentGoalsData } from '../../../../utils/state-machine/types';

export type InvestmentGoalsFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    InvestorProfileDataAttribute.investmentGoals
  >;
  isLoading?: boolean;
  onSubmit: (data: InvestmentGoalsData) => void;
};

const InvestmentGoalsForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: InvestmentGoalsFormProps) => {
  const { handleSubmit } = useForm<InvestmentGoalsData>({
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

export default InvestmentGoalsForm;
