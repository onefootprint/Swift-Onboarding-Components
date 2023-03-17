import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button/continue-button';
import { DeclarationData } from '../../../../utils/state-machine/types';

export type ConflictOfInterestFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    InvestorProfileDataAttribute.declarations
  >;
  isLoading?: boolean;
  onSubmit: (data: DeclarationData) => void;
};

const ConflictOfInterestForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: ConflictOfInterestFormProps) => {
  const { handleSubmit } = useForm<DeclarationData>({
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

export default ConflictOfInterestForm;
