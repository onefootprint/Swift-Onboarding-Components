import React, { forwardRef } from 'react';
import styled, { css } from 'styled';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import media from '../../utils/media';

export type ContainerProps = {
  as?: 'div' | 'section' | 'main' | 'article' | 'nav' | 'header' | 'footer';
  children: React.ReactNode;
  testID?: string;
  sx?: SXStyleProps;
};

const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ as = 'div', sx, children, testID }: ContainerProps, ref) => {
    const sxStyles = useSX(sx);
    return (
      <StyledContainer as={as} data-testid={testID} ref={ref} sx={sxStyles}>
        {children}
      </StyledContainer>
    );
  },
);

const StyledContainer = styled.div<{ sx: SXStyles }>`
  ${({ theme, sx }) => css`
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    ${sx};

    ${media.between('xs', 'sm')`
      width: 100%;
      padding-left: ${theme.grid.container.margin.xs}px;
      padding-right: ${theme.grid.container.margin.xs}px;
    `}

    ${media.between('sm', 'md')`
      width: 100%;
      padding-left: ${theme.grid.container.margin.sm}px;
      padding-right: ${theme.grid.container.margin.sm}px;
    `}

    ${media.between('md', 'lg')`
      width: 100%;
      padding-left: ${theme.grid.container.margin.md}px;
      padding-right: ${theme.grid.container.margin.md}px;
    `}

    ${media.between('lg', 'xl')`
      width: ${theme.grid.container.maxWidth.lg}px;
      padding-left: ${theme.grid.container.margin.lg}px;
      padding-right: ${theme.grid.container.margin.lg}px;
    `}

    ${media.greaterThan('xl')`
      width: ${theme.grid.container.maxWidth.xl}px;
      padding-left: ${theme.grid.container.margin.xl}px;
      padding-right: ${theme.grid.container.margin.xl}px;
    `}
  `}
`;

export default Container;
