import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { StackProps, StackTag } from './stack.types';
import { getBorders, getMargin, getPadding } from './stack.utils';

const Stack = styled('div').attrs<{ as: StackTag }>(({ as, ...props }) => ({
  as,
  ...props,
}))<StackProps>`
  ${({ theme, sx, ...props }) => css`
    display: ${props.inline ? 'inline-flex' : 'flex'};
    gap: ${theme.spacing[props.gap || 0]};
    flex-direction: ${props.direction};
    align-items: ${props.align};
    justify-content: ${props.justify};
    flex-wrap: ${props.flexWrap};
    flex-grow: ${props.flexGrow};
    visibility: ${props.visibility};

    /* Box */
    ${getBorders(props as StackProps, theme)};
    padding: ${getPadding(props as StackProps, theme)};
    margin: ${getMargin(props as StackProps, theme)};
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
    top: ${props.top ? theme.spacing[props.top] : undefined};
    bottom: ${props.bottom ? theme.spacing[props.bottom] : undefined};
    left: ${props.left ? theme.spacing[props.left] : undefined};
    right: ${props.right ? theme.spacing[props.right] : undefined};
    z-index: ${props.zIndex};
  `}
`;

export default Stack;
