import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import media from '../../utils/media';

export type ContainerProps = {
  as?: 'div' | 'section' | 'main' | 'article' | 'nav' | 'header' | 'footer';
  children: React.ReactNode;
  fluid?: boolean;
  id?: string;
  sx?: SXStyleProps;
  testID?: string;
};

const Container = forwardRef<HTMLElement, ContainerProps>(
  (
    { id, as = 'div', sx, children, testID, fluid = false }: ContainerProps,
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
      >
        {children}
      </StyledContainer>
    );
  },
);

const StyledContainer = styled.div<{ sx: SXStyles }>`
  ${({ theme, sx }) => css`
    margin-left: auto;
    margin-right: auto;
    ${sx};
    ${media.between('xs', 'sm')`
      width: 100%;
      padding-left: ${theme.grid.container.margin.xs}px;
      padding-right: ${theme.grid.container.margin.xs}px;
    `}
    ${media.between('sm', 'md')`
      width: ${theme.grid.container.maxWidth.sm}px;
      padding-left: ${theme.grid.container.margin.sm}px;
      padding-right: ${theme.grid.container.margin.sm}px;
    `}
    ${media.between('md', 'lg')`
      width: ${theme.grid.container.maxWidth.md}px;
      padding-left: ${theme.grid.container.margin.md}px;
      padding-right: ${theme.grid.container.margin.md}px;
    `}
    ${media.between('lg', 'xl')`
      width: ${theme.grid.container.maxWidth.lg}px;
      padding-left: ${theme.grid.container.margin.lg}px;
      padding-right: ${theme.grid.container.margin.lg}px;
    `}
    
    ${media.greaterThan('xl')`
      &[data-fluid='true'] {
        width: 100%;
        padding-left: ${theme.grid.container.margin.xs}px;
        padding-right: ${theme.grid.container.margin.xs}px;
      }
      &[data-fluid='false'] {
        width: ${theme.grid.container.maxWidth.xl}px;
        padding-left: ${theme.grid.container.margin.xl}px;
        padding-right: ${theme.grid.container.margin.xl}px;
      }
    `}
  `}
`;

export default Container;
