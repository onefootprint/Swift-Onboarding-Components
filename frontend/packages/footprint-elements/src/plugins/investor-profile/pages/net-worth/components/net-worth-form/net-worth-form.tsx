import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button/continue-button';
import { NetWorthData } from '../../../../utils/state-machine/types';

export type NetWorthFormProps = {
  isLoading?: boolean;
  defaultValues?: Pick<
    InvestorProfileData,
    InvestorProfileDataAttribute.netWorth
  >;
  onSubmit: (data: NetWorthData) => void;
};

const NetWorthForm = ({
  isLoading,
  defaultValues,
  onSubmit,
}: NetWorthFormProps) => {
  const { handleSubmit } = useForm<NetWorthData>({
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

export default NetWorthForm;
