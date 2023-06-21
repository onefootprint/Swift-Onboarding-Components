import styled, { css } from '@onefootprint/styled';
import React from 'react';

export type LabelProps = {
  children: string;
  hasError?: boolean;
  htmlFor?: string;
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
  <LabelContainer>
    <StyledLabel
      className="fp-label"
      data-has-error={hasError}
      data-size={size}
      htmlFor={htmlFor}
      id={id}
    >
      {children}
    </StyledLabel>
  </LabelContainer>
);

const LabelContainer = styled.div`
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

export default Label;
