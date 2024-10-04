import type { Spacing } from '@onefootprint/design-tokens';
import type { PopoverContentProps as RadixPopoverContentProps } from '@radix-ui/react-popover';
import * as RadixPopover from '@radix-ui/react-popover';
import type * as CSS from 'csstype';
import { forwardRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import Box from '../../../box';

export type PopoverContentProps = RadixPopoverContentProps & {
  children: React.ReactNode;
  minHeight?: CSS.Property.MinHeight;
  maxHeight?: CSS.Property.MaxHeight;
  minWidth?: CSS.Property.MinWidth;
  maxWidth?: CSS.Property.MaxWidth;
  padding?: Spacing;
  paddingLeft?: Spacing;
  paddingRight?: Spacing;
  paddingTop?: Spacing;
  paddingBottom?: Spacing;
};

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      children,
      minHeight,
      maxHeight,
      minWidth,
      maxWidth,
      align,
      side = 'top',
      padding,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      ...props
    },
    ref,
  ) => {
    return (
      <RadixPopover.Content sideOffset={8} {...props} ref={ref}>
        <StyledContent
          $minHeight={minHeight}
          $maxHeight={maxHeight}
          $minWidth={minWidth}
          $maxWidth={maxWidth}
          $padding={padding}
          $paddingLeft={paddingLeft}
          $paddingRight={paddingRight}
          $paddingTop={paddingTop}
          $paddingBottom={paddingBottom}
        >
          {children}
        </StyledContent>
      </RadixPopover.Content>
    );
  },
);

const StyledContent = styled(Box)<{
  $minHeight?: CSS.Property.MinHeight;
  $maxHeight?: CSS.Property.MaxHeight;
  $minWidth?: CSS.Property.MinWidth;
  $maxWidth?: CSS.Property.MaxWidth;
  $padding?: Spacing;
  $paddingLeft?: Spacing;
  $paddingRight?: Spacing;
  $paddingTop?: Spacing;
  $paddingBottom?: Spacing;
}>`
  ${({
    theme,
    $minHeight,
    $maxHeight,
    $minWidth,
    $maxWidth,
    $padding,
    $paddingLeft,
    $paddingRight,
    $paddingTop,
    $paddingBottom,
  }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    animation: ${slideAnimation} 150ms cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
    z-index: ${theme.zIndex.popover};
    ${$padding && `padding: ${theme.spacing[$padding]};`}
    ${$paddingLeft && `padding-left: ${theme.spacing[$paddingLeft]};`}
    ${$paddingRight && `padding-right: ${theme.spacing[$paddingRight]};`}
    ${$paddingTop && `padding-top: ${theme.spacing[$paddingTop]};`}
    ${$paddingBottom && `padding-bottom: ${theme.spacing[$paddingBottom]};`}
    ${$minHeight && `min-height: ${$minHeight};`}
    ${$maxHeight && `max-height: ${$maxHeight};`}
    ${$minWidth && `min-width: ${$minWidth};`}
    ${$maxWidth && `max-width: ${$maxWidth};`}
  `}
`;

const slideAnimation = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export default PopoverContent;
