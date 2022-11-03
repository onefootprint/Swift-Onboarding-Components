import React from 'react';
import styled, { css } from 'styled-components';

export type HintProps = {
  size?: 'compact' | 'default';
  children: string;
  className?: string;
  hasError?: boolean;
  id?: string;
};

const Hint = ({
  children,
  className,
  hasError = false,
  id,
  size = 'default',
}: HintProps) => (
  <HintContainer
    id={id}
    className={`${className} fp-input-hint`}
    data-has-error={hasError}
    data-size={size}
  >
    {children}
  </HintContainer>
);

const HintContainer = styled.div`
  ${({ theme }) => {
    const { inputHint } = theme.components;

    return css`
      margin-top: ${theme.spacing[3]};
      text-align: left;

      &[data-has-error='false'] {
        color: ${inputHint.states.default.color};
      }

      &[data-has-error='true'] {
        color: ${inputHint.states.error.color};
      }

      &[data-size='default'] {
        font: ${inputHint.size.default.typography};
      }

      &[data-size='compact'] {
        font: ${inputHint.size.compact.typography};
      }
    `;
  }}
`;

export default Hint;
