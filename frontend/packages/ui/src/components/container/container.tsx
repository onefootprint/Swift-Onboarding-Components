/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef } from 'react';
import styled, { css, DefaultTheme } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import media from '../../utils/media';

type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const ALL_SIZES: ContainerSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const size: Record<ContainerSize, number> = {
  xs: 0,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
};

export type ContainerProps = {
  as?: 'div' | 'section' | 'main' | 'article' | 'nav' | 'header' | 'footer';
  children: React.ReactNode;
  id?: string;
  sx?: SXStyleProps;
  testID?: string;
  minSize?: ContainerSize;
};

const Container = forwardRef<HTMLElement, ContainerProps>(
  (
    {
      id,
      as = 'div',
      sx,
      children,
      testID,
      minSize = 'xs',
      ...remainingProps
    }: ContainerProps,
    ref,
  ) => {
    const sxStyles = useSX(sx);
    return (
      <StyledContainer
        as={as}
        data-testid={testID}
        id={id}
        ref={ref}
        sx={sxStyles}
        minSize={minSize}
        {...remainingProps}
      >
        {children}
      </StyledContainer>
    );
  },
);

const styleForBounds = (
  theme: DefaultTheme,
  minSize: ContainerSize,
  lowerBound: ContainerSize,
  upperBound: ContainerSize | null,
) => {
  // Generate the styles for this viewport range. A null value is treated as an unbounded range
  let styleFn;
  if (lowerBound === minSize) {
    styleFn = media.lessThan(upperBound!);
  } else if (!upperBound) {
    styleFn = media.greaterThan(lowerBound!);
  } else {
    styleFn = media.between(lowerBound, upperBound);
  }
  // The width for xs should be 100%, but we have no way of specifying non-px widths in the theme
  const width =
    lowerBound === 'xs'
      ? '100%'
      : `${theme.grid.container.maxWidth[lowerBound]}px`;
  const paddingX = theme.grid.container.margin[lowerBound];
  return styleFn`
    width: ${width};
    padding-left: ${paddingX}px;
    padding-right: ${paddingX}px;
  `;
};

function zipAdjacent<T>(arr: T[]) {
  // Create an array of size bounds for which to generate a media query.
  // A null value represents an open-ended bound
  const arrOffset = [...arr.slice(1), null];
  return arr.map((x, index) => [x, arrOffset[index]]);
}

const StyledContainer = styled.div<{
  sx: SXStyles;
  minSize: ContainerSize;
}>`
  ${({ theme, sx, minSize }) => css`
    margin-left: auto;
    margin-right: auto;
    ${sx};

    ${zipAdjacent(ALL_SIZES.filter(s => size[s] >= size[minSize])).map(bounds =>
      styleForBounds(theme, minSize, bounds[0]!, bounds[1]).join(''),
    )}
  `}
`;

export default Container;
