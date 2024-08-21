import { Grid } from '@onefootprint/ui';
import type { FormHTMLAttributes } from 'react';
import type React from 'react';
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
    <Container data-dd-privacy="mask">{children}</Container>
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
    row-gap: ${theme.spacing[7]};
  `};
`;

export default FormWithErrorAndFooter;
