import React from 'react';
import styled, { css } from 'styled-components';

import { createTypography } from '../../../utils/mixins';

export type LabelProps = {
  children: string;
  hasError?: boolean;
  htmlFor: string;
  id?: string;
  size?: 'default' | 'compact';
};

const Label = ({
  children,
  hasError = false,
  htmlFor,
  id,
  size = 'default',
}: LabelProps) => (
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
    margin-bottom: ${theme.spacing[3]}px;
  `}
`;

const StyledLabel = styled.label`
  ${({ theme }) => {
    const { inputLabel } = theme.components;

    return css`
      &[data-has-error='false'] {
        color: ${inputLabel.states.default.color};
      }

      &[data-has-error='true'] {
        color: ${inputLabel.states.error.color};
      }

      &[data-size='default'] {
        ${createTypography(inputLabel.size.default.typography)}
      }

      &[data-size='compact'] {
        ${createTypography(inputLabel.size.compact.typography)}
      }
    `;
  }}
`;

export default Label;
