import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import useSX from '../../hooks/use-sx';
import { createFontStyles } from '../../utils/mixins';
import type { BoxProps, BoxPropsStyles, BoxTag } from './box.types';
import { getBorders, getMargin, getPadding } from './box.utils';

const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      'aria-busy': ariaBusy,
      ariaLabel,
      as = 'div',
      children,
      id,
      role,
      testID,
      className,
      fontStyle,
      sx,
      ...props
    }: BoxProps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: any,
  ) => {
    const sxStyles = useSX(sx);
    return (
      <StyledBox
        aria-busy={ariaBusy}
        aria-label={ariaLabel}
        as={as}
        data-testid={testID}
        id={id}
        ref={ref}
        sx={sxStyles}
        role={role}
        className={className}
        fontStyle={fontStyle}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      >
        {children}
      </StyledBox>
    );
  },
);

const StyledBox = styled('div').attrs<{ as: BoxTag }>(({ as, ...props }) => ({
  as,
  ...props,
}))<BoxPropsStyles>`
  ${({ theme, sx, ...props }) => css`
    ${sx}
    ${getBorders(props as BoxProps, theme)};
    padding: ${getPadding(props as BoxProps, theme)};
    margin: ${getMargin(props as BoxProps, theme)};
    ${props.fontStyle && createFontStyles(props.fontStyle)};
    box-shadow: ${props.elevation
      ? theme.elevation[props.elevation]
      : undefined};
    background-color: ${(props.backgroundColor &&
      theme.backgroundColor[props.backgroundColor]) ||
    (props.surfaceColor && theme.surfaceColor[props.surfaceColor])};
    position: ${props.position || 'relative'};
    display: ${props.display};
    text-align: ${props.textAlign};
    border-radius: ${props.borderRadius
      ? theme.borderRadius[props.borderRadius]
      : undefined};
    width: ${props.width};
    height: ${props.height};
    overflow: ${props.overflow};
    min-width: ${props.minWidth};
    min-height: ${props.minHeight};
    max-width: ${props.maxWidth};
    max-height: ${props.maxHeight};
    visibility: ${props.visibility};
    overflow: ${props.overflow};
    gap: ${props.gap ? theme.spacing[props.gap] : undefined};
    top: ${props.top ? theme.spacing[props.top] : undefined};
    bottom: ${props.bottom ? theme.spacing[props.bottom] : undefined};
    left: ${props.left ? theme.spacing[props.left] : undefined};
    right: ${props.right ? theme.spacing[props.right] : undefined};
    z-index: ${props.zIndex};
  `}
`;

export default Box;
