'use client';

import type { Spacing } from '@onefootprint/design-tokens';
import * as ScrollAreaRadix from '@radix-ui/react-scroll-area';
import type * as CSS from 'csstype';
import { forwardRef, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

type ScrollAreaProps = {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
  hideBottomLine?: boolean;
  hideTopLine?: boolean;
  padding?: Spacing;
  paddingTop?: Spacing;
  paddingRight?: Spacing;
  paddingBottom?: Spacing;
  paddingLeft?: Spacing;
  height?: CSS.Property.Height;
  maxHeight?: CSS.Property.MaxHeight;
  overflow?: CSS.Property.Overflow;
};

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      children,
      className,
      asChild,
      hideBottomLine,
      hideTopLine,
      padding,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      height,
      maxHeight = '100%',
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [isOverflowTop, setIsOverflowTop] = useState(false);
    const [isOverflowBottom, setIsOverflowBottom] = useState(false);

    useEffect(() => {
      const scrollContainer = viewportRef.current;

      const checkOverflow = () => {
        if (scrollContainer) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          setIsOverflowTop(scrollTop > 0);
          setIsOverflowBottom(scrollTop + clientHeight < scrollHeight);
        }
      };

      checkOverflow();

      scrollContainer?.addEventListener('scroll', checkOverflow);

      return () => {
        scrollContainer?.removeEventListener('scroll', checkOverflow);
      };
    }, []);

    return (
      <StyledRoot className={className} $maxHeight={maxHeight} $height={height} ref={ref}>
        <StyledViewport
          ref={viewportRef}
          $padding={padding}
          $paddingTop={paddingTop}
          $paddingRight={paddingRight}
          $paddingBottom={paddingBottom}
          $paddingLeft={paddingLeft}
          $isOverflowTop={isOverflowTop && !hideTopLine}
          $isOverflowBottom={isOverflowBottom && !hideBottomLine}
          asChild={asChild}
        >
          {children}
        </StyledViewport>
        <ScrollAreaRadix.Scrollbar orientation="vertical">
          <ScrollAreaRadix.Thumb />
        </ScrollAreaRadix.Scrollbar>
      </StyledRoot>
    );
  },
);

const StyledRoot = styled(ScrollAreaRadix.Root)<{
  $maxHeight?: CSS.Property.MaxHeight;
  $height?: CSS.Property.Height;
  $overflow?: CSS.Property.Overflow;
}>`
  ${({ $maxHeight, $height, $overflow }) => css`
    ${$maxHeight && `max-height: ${$maxHeight};`}
    ${$height && `height: ${$height};`}
    ${$overflow && `overflow: ${$overflow};`}
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    min-height: 100%;
    position: relative;
  `}
`;

const StyledViewport = styled(ScrollAreaRadix.Viewport)<{
  $padding?: Spacing;
  $paddingTop?: Spacing;
  $paddingRight?: Spacing;
  $paddingBottom?: Spacing;
  $paddingLeft?: Spacing;
  $isOverflowTop: boolean;
  $isOverflowBottom: boolean;
}>`
  ${({
    $padding,
    $paddingTop,
    $paddingRight,
    $paddingBottom,
    $paddingLeft,
    $isOverflowTop,
    $isOverflowBottom,
    theme,
  }) => css`
    width: 100%;
    box-sizing: border-box;
    max-height: 100%;
    min-height: 100%;
    ${$padding && `padding: ${theme.spacing[$padding]};`}
    ${$paddingTop && `padding-top: ${theme.spacing[$paddingTop]};`}
    ${$paddingRight && `padding-right: ${theme.spacing[$paddingRight]};`}
    ${$paddingBottom && `padding-bottom: ${theme.spacing[$paddingBottom]};`}
    ${$paddingLeft && `padding-left: ${theme.spacing[$paddingLeft]};`}

    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: ${theme.borderWidth[1]};
      background-color: ${theme.borderColor.tertiary};
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }

    &::before {
      top: 0;
      opacity: ${$isOverflowTop ? 1 : 0};
    }

    &::after {
      bottom: 0;
      opacity: ${$isOverflowBottom ? 1 : 0};
    }
  `}
`;

export default ScrollArea;
