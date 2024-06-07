import { Grid, media } from '@onefootprint/ui';
import type { FormHTMLAttributes } from 'react';
import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import ContinueButton from './components/continue-button';
import ErrorComponent from './components/error';

type OptionsContainerProps = {
  children: React.ReactNode;
  ctaLabel?: string;
  error?: string; // Form-wide errors
  formAttributes?: FormHTMLAttributes<HTMLFormElement>;
  isLoading?: boolean;
  subtitle: string;
  title: string;
};

const CustomForm = ({
  children,
  ctaLabel,
  error,
  formAttributes,
  isLoading,
  subtitle,
  title,
}: OptionsContainerProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Form {...formAttributes}>
    <HeaderTitle title={title} subtitle={subtitle} />
    <Container data-private data-dd-privacy="mask">
      {children}
    </Container>
    {error && <ErrorComponent label={error} />}
    <ContinueButton isLoading={isLoading} label={ctaLabel} />
  </Form>
);

const Container = styled(Grid.Container)`
  ${({ theme }) => css`
    gap: ${theme.spacing[6]};

    ${media.greaterThan('md')`
      gap: ${theme.spacing[5]};
    `}
  `}
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `};
`;

export default CustomForm;
