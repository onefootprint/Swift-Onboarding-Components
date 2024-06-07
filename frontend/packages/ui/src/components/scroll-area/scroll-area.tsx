'use client';

import type { Spacing } from '@onefootprint/design-tokens';
import * as ScrollAreaRadix from '@radix-ui/react-scroll-area';
import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

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
  maxWidth?: string;
  maxHeight?: string;
};

const ScrollArea = ({
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
  maxWidth,
  maxHeight,
}: ScrollAreaProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollAreaHeight, setScrollAreaHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [showBottomLine, setShowBottomLine] = useState(true);
  const [showTopLine, setShowTopLine] = useState(false);

  const noOverflow = viewportHeight <= scrollAreaHeight;
  const scrolledToBottom = scrollTop > 0 && scrollTop + scrollAreaHeight >= viewportHeight;
  const scrolledToTop = scrollTop === 0;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (noOverflow || hideBottomLine) {
      setShowBottomLine(false);
    } else {
      setShowBottomLine(!scrolledToBottom);
    }
  }, [noOverflow, scrolledToBottom, hideBottomLine]);

  useEffect(() => {
    if (noOverflow || hideTopLine) {
      setShowTopLine(false);
    } else {
      setShowTopLine(!scrolledToTop);
    }
  }, [noOverflow, scrolledToTop, hideTopLine]);

  useEffectOnce(() => {
    const updateDimensions = () => {
      setScrollAreaHeight(scrollAreaRef.current?.clientHeight ?? 0);
      setViewportHeight(viewportRef.current?.clientHeight ?? 0);
    };

    const resizeObserver = new ResizeObserver(updateDimensions);

    const startResizeObserve = () => {
      if (viewportRef.current) resizeObserver.observe(viewportRef.current);
    };

    const stopResizeObserve = () => {
      if (viewportRef.current) resizeObserver.unobserve(viewportRef.current);
    };

    startResizeObserve();

    return stopResizeObserve;
  });

  return (
    <StyledRoot
      ref={scrollAreaRef}
      data-line-bottom={showBottomLine}
      data-line-top={showTopLine}
      onScroll={handleScroll}
      asChild={asChild}
      style={{ maxHeight }}
      className={className}
    >
      <StyledViewport
        className={className}
        asChild
        ref={viewportRef}
        $padding={padding}
        $paddingTop={paddingTop}
        $paddingRight={paddingRight}
        $paddingBottom={paddingBottom}
        $paddingLeft={paddingLeft}
        $maxWidth={maxWidth}
        $maxHeight={maxHeight}
      >
        {children}
      </StyledViewport>
      <ScrollAreaRadix.Scrollbar orientation="vertical">
        <ScrollAreaRadix.Thumb />
      </ScrollAreaRadix.Scrollbar>
    </StyledRoot>
  );
};

const StyledRoot = styled(ScrollAreaRadix.Root)`
  ${({ theme }) => css`
    overflow: auto;

    &[data-line-bottom='false'] {
      border-bottom: ${theme.borderWidth[1]} solid
        ${theme.borderColor.transparent};
    }

    &[data-line-bottom='true'] {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }

    &[data-line-top='false'] {
      border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.transparent};
    }

    &[data-line-top='true'] {
      border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

const StyledViewport = styled(ScrollAreaRadix.Viewport)<{
  $padding?: Spacing;
  $paddingTop?: Spacing;
  $paddingRight?: Spacing;
  $paddingBottom?: Spacing;
  $paddingLeft?: Spacing;
  $maxWidth?: string;
  $maxHeight?: string;
}>`
  ${({ $padding, $paddingTop, $paddingRight, $paddingBottom, $paddingLeft, $maxWidth, $maxHeight }) => css`
    ${({ theme }) => css`
      height: 100%;
      width: 100%;
      padding: ${$padding ? theme.spacing[$padding] : undefined};
      padding-top: ${$paddingTop ? theme.spacing[$paddingTop] : undefined};
      padding-right: ${$paddingRight ? theme.spacing[$paddingRight] : undefined};
      padding-bottom: ${$paddingBottom ? theme.spacing[$paddingBottom] : undefined};
      padding-left: ${$paddingLeft ? theme.spacing[$paddingLeft] : undefined};
      max-width: ${$maxWidth};
      max-height: ${$maxHeight};
    `}
  `}
`;

export default ScrollArea;
