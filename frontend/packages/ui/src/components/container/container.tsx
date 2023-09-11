import styled, { css } from '@onefootprint/styled';
import React, { forwardRef } from 'react';

import type { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import useSX from '../../hooks/use-sx';
import media from '../../utils/media';

export type ContainerProps = {
  as?: 'div' | 'section' | 'main' | 'article' | 'nav' | 'header' | 'footer';
  children: React.ReactNode;
  fluid?: boolean;
  id?: string;
  sx?: SXStyleProps;
  testID?: string;
  className?: string;
};

const Container = forwardRef<HTMLElement, ContainerProps>(
  (
    {
      id,
      as = 'div',
      sx,
      children,
      testID,
      fluid = false,
      className,
    }: ContainerProps,
    ref,
  ) => {
    const sxStyles = useSX(sx);
    return (
      <StyledContainer
        as={as}
        data-testid={testID}
        data-fluid={fluid}
        id={id}
        ref={ref}
        sx={sxStyles}
        className={className}
      >
        {children}
      </StyledContainer>
    );
  },
);

const StyledContainer = styled.div<{ sx: SXStyles }>`
  ${({ theme, sx }) => css`
    position: relative;
    margin-left: auto;
    margin-right: auto;

    ${sx};

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
