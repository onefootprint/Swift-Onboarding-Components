import { media } from '@onefootprint/ui';
import React, { FormHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import ContinueButton from './components/continue-button';
import Error from './components/error';

type OptionsContainerProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  isLoading?: boolean;
  formAttributes?: FormHTMLAttributes<HTMLFormElement>;
  error?: string; // Form-wide errors
};

const CustomForm = ({
  title,
  subtitle,
  children,
  isLoading,
  error,
  formAttributes,
}: OptionsContainerProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <StyledForm {...formAttributes}>
    <HeaderTitle title={title} subtitle={subtitle} />
    <Container data-private>{children}</Container>
    {error && <Error label={error} />}
    <ContinueButton isLoading={isLoading} />
  </StyledForm>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[6]};

    ${media.greaterThan('md')`
      gap: ${theme.spacing[5]};
    `}
  `}
`;

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default CustomForm;
