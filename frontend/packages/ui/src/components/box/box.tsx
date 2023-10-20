import styled, { css } from '@onefootprint/styled';
import React, { forwardRef } from 'react';

import useSX from '../../hooks/use-sx';
import { createFontStyles } from '../../utils/mixins';
import type { BoxProps, BoxPropsStyles } from './box.types';
import { getBorders, getMargin, getPadding } from './box.utils';

type BoxTag = 'div' | 'section' | 'article' | 'aside' | 'span' | 'main';

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
      sx,
      ...props
    }: BoxProps,
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
    box-shadow: ${props.elevation ? theme.elevation[props.elevation] : 'none'};
    background-color: ${(props.backgroundColor &&
      theme.backgroundColor[props.backgroundColor]) ||
    (props.surfaceColor && theme.surfaceColor[props.surfaceColor])};
    position: ${props.position || 'relative'};
    display: ${props.display};
    text-align: ${props.textAlign};
    border-radius: ${theme.borderRadius[
      props.borderRadius ? props.borderRadius : 'none'
    ]};
    width: ${props.width};
    height: ${props.height};
    overflow: ${props.overflow};
    min-with: ${props.minWidth};
    min-height: ${props.minHeight};
    max-width: ${props.maxWidth};
    max-height: ${props.maxHeight};
    visibility: ${props.visibility};
    overflow: ${props.overflow};
    gap: ${props.gap ? theme.spacing[props.gap] : '0'};
  `}
`;

export default Box;
