import styled, { css } from '@onefootprint/styled';
import React from 'react';

import { createTypography } from '../../../utils/mixins';

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
    className={`${className} fp-hint fp-custom-appearance`}
    data-has-error={hasError}
    data-size={size}
  >
    {children}
  </HintContainer>
);

const HintContainer = styled.div`
  ${({ theme }) => {
    const { hint } = theme.components;

    return css`
      margin-top: ${theme.spacing[3]};
      text-align: left;

      &[data-has-error='false'] {
        color: ${hint.states.default.color};
      }

      &[data-has-error='true'] {
        color: ${hint.states.error.color};
      }

      &[data-size='default'] {
        ${createTypography(hint.size.default.typography)}
      }

      &[data-size='compact'] {
        ${createTypography(hint.size.compact.typography)}
      }
    `;
  }}
`;

export default Hint;
