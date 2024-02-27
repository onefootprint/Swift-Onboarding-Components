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
  (
    { as = 'p', children, left, right, truncate, variant, ...props }: TextProps,
    ref,
  ) => (
    <StyledText
      tag={as || variantMapping[variant] || 'p'}
      ref={ref}
      typography={variant}
      $truncate={truncate}
      {...props}
    >
      {children}
    </StyledText>
  ),
);

const StyledText = styled(Box)<{ $truncate?: boolean }>`
  ${({ theme, $truncate }) => css`
    ${$truncate &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}

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
