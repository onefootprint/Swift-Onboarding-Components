/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import media from '../../utils/media';
import type { StackProps } from '../stack';
import Stack from '../stack';

export type ContainerProps = StackProps & {
  fluid?: boolean;
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, fluid = false, ...props }: ContainerProps, ref) => (
    <StyledContainer data-fluid={fluid} display="flex" flexDirection="column" ref={ref} {...props}>
      {children}
    </StyledContainer>
  ),
);

const StyledContainer = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    margin-left: auto;
    margin-right: auto;

    &[data-fluid='true'] {
      width: 100%;
      padding-left: ${theme.grid.container.margin.xs}px;
      padding-right: ${theme.grid.container.margin.xs}px;
    }

    &[data-fluid='false'] {
      ${media.between('xs', 'sm')`
        width: calc(100% - ${theme.grid.container.margin.xs * 2}px);
      `}
      ${media.between('sm', 'md')`
        width: calc(100% - ${theme.grid.container.margin.sm * 2}px);
      `}
      ${media.between('md', 'lg')`
        width: calc(100% - ${theme.grid.container.margin.md * 2}px);
      `}
      ${media.between('lg', 'xl')`
        width: calc(100% - ${theme.grid.container.margin.lg * 2}px);
      `}
      ${media.greaterThan('xl')`
        width: calc(100% - ${theme.grid.container.margin.xl * 2}px);
        max-width: ${theme.grid.container.maxWidth.xl}px;
      `}
    }
  `}
`;

export default Container;
