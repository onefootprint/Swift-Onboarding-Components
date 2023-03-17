import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button/continue-button';
import { RiskToleranceData } from '../../../../utils/state-machine/types';

export type RiskToleranceFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    InvestorProfileDataAttribute.riskTolerance
  >;
  isLoading?: boolean;
  onSubmit: (data: RiskToleranceData) => void;
};

const RiskToleranceForm = ({
  isLoading,
  defaultValues,
  onSubmit,
}: RiskToleranceFormProps) => {
  const { handleSubmit } = useForm<RiskToleranceData>({
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

export default RiskToleranceForm;
