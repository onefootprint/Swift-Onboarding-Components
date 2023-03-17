import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button/continue-button';
import { EmployedByBrokerageData } from '../../../../utils/state-machine/types';

export type BrokerageEmploymentFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    | InvestorProfileDataAttribute.employedByBrokerage
    | InvestorProfileDataAttribute.employedByBrokerageFirm
  >;
  isLoading?: boolean;
  onSubmit: (data: EmployedByBrokerageData) => void;
};

const BrokerageEmploymentForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: BrokerageEmploymentFormProps) => {
  const { handleSubmit } = useForm<EmployedByBrokerageData>({
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

export default BrokerageEmploymentForm;
