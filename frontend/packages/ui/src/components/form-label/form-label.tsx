import React from 'react';
import styled, { css } from 'styled-components';

export type FormLabelProps = {
  children: string;
  hasError?: boolean;
  htmlFor?: string;
  id?: string;
  size?: 'default' | 'compact';
};

const FormLabel = ({
  children,
  hasError = false,
  htmlFor,
  id,
  size = 'default',
}: FormLabelProps) => (
  <Container>
    <StyledLabel
      className="fp-label"
      data-has-error={hasError}
      data-size={size}
      htmlFor={htmlFor}
      id={id}
    >
      {children}
    </StyledLabel>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const StyledLabel = styled.label`
  ${({ theme }) => {
    const { inputLabel } = theme.components;

    return css`
      color: ${inputLabel.states.default.color};
      font: ${inputLabel.size.default.typography};

      &[data-has-error='true'] {
        color: ${inputLabel.states.error.color};
      }

      &[data-size='compact'] {
        font: ${inputLabel.size.compact.typography};
      }
    `;
  }}
`;

export default FormLabel;
