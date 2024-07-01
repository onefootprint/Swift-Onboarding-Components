import { Grid } from '@onefootprint/ui';
import type { FormHTMLAttributes } from 'react';
import React from 'react';
import styled, { css } from 'styled-components';

import ErrorComponent from './components/error';

type FormWithErrorAndFooterProps = {
  children: React.ReactNode;
  error?: string; // Form-wide errors
  footer: React.ReactNode;
  formAttributes?: FormHTMLAttributes<HTMLFormElement>;
};

const FormWithErrorAndFooter = ({ children, error, footer, formAttributes }: FormWithErrorAndFooterProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Form {...formAttributes}>
    <Container data-private data-dd-privacy="mask">
      {children}
    </Container>
    {error && <ErrorComponent label={error} />}
    {footer}
  </Form>
);

const Container = styled(Grid.Container)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};
  `}
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[6]};
  `};
`;

export default FormWithErrorAndFooter;
