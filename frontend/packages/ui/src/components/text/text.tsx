/* eslint-disable react/jsx-props-no-spreading */
import type { FontVariant } from '@onefootprint/design-tokens';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import type { BoxPrimitives } from '../box';
import Box from '../box';
import variantMapping from './text.constants';

export type TextProps = {
  variant: FontVariant;
  truncate?: boolean;
} & BoxPrimitives<HTMLParagraphElement>;

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ tag = 'p', children, truncate, variant, ...props }: TextProps, ref) => (
    <StyledText
      data-truncate={truncate}
      data-variant={variant}
      ref={ref}
      tag={tag || variantMapping[variant] || 'p'}
      typography={variant}
      {...props}
    >
      {children}
    </StyledText>
  ),
);

const StyledText = styled(Box)`
  ${({ theme }) => css`
    &[data-trucate='true'] {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    a {
      color: ${theme.components.link.color};
      text-decoration: none;

      @media (hover: hover) {
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `}
`;

export default Text;
