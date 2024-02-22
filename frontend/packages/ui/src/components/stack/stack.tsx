import styled, { css } from '@onefootprint/styled';

import { createFontStyles } from '../../utils/mixins';
import type { StackProps } from './stack.types';
import { getBorders, getMargin, getPadding } from './stack.utils';

const Stack = styled.div<StackProps>`
  ${({ theme, ...props }) => css`
    display: ${props.inline ? 'inline-flex' : 'flex'};
    flex-direction: ${props.direction};
    align-items: ${props.align};
    justify-content: ${props.justify};
    flex-wrap: ${props.flexWrap};
    flex-grow: ${props.flexGrow};
    visibility: ${props.visibility};
    white-space: ${props.whiteSpace};
    text-overflow: ${props.textOverflow};

    /* Box */
    ${getBorders(props as StackProps, theme)};
    padding: ${getPadding(props as StackProps, theme)};
    margin: ${getMargin(props as StackProps, theme)};
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

export default Stack;
