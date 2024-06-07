/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import styled, { css } from 'styled-components';

import type { BoxPrimitives } from '../box';
import Box from '../box';

export type DividerProps = {
  variant?: 'primary' | 'secondary';
} & BoxPrimitives<HTMLElement>;

const Divider = ({ variant = 'primary', ...props }: DividerProps) => (
  <StyledDivider $variant={variant} aria-orientation="horizontal" role="separator" {...props} />
);

const StyledDivider = styled(Box)<{ $variant: 'primary' | 'secondary' }>`
  ${({ theme, $variant = 'primary' }) => css`
    border-color: ${theme.borderColor.tertiary};
    border-image: initial;
    border-style: ${$variant === 'primary' ? 'solid' : 'dashed'};
    border-width: 0px 0px ${theme.borderWidth[1]};
    opacity: 1;
    width: 100%;
  `}
`;

export default Divider;
