import styled, { css } from '@onefootprint/styled';
import * as ScrollAreaRadix from '@radix-ui/react-scroll-area';
import React, { useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import type { SXStyleProps, SXStyles } from '../../hooks';
import { useSX } from '../../hooks';

type ScrollAreaProps = {
  asChild?: boolean;
  children: React.ReactNode;
  sx?: SXStyleProps;
  className?: string;
  maxHeight?: string;
  hideBottomLine?: boolean;
  hideTopLine?: boolean;
};

const ScrollArea = ({
  children,
  sx,
  asChild,
  className,
  maxHeight,
  hideBottomLine,
  hideTopLine,
}: ScrollAreaProps) => {
  const sxStyles = useSX(sx);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollAreaHeight, setScrollAreaHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [showBottomLine, setShowBottomLine] = useState(true);
  const [showTopLine, setShowTopLine] = useState(false);

  const noOverflow = viewportHeight <= scrollAreaHeight;
  const scrolledToBottom =
    scrollTop > 0 && scrollTop + scrollAreaHeight >= viewportHeight;
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
    >
      <StyledViewport
        className={className}
        sx={sxStyles}
        asChild
        ref={viewportRef}
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

const StyledViewport = styled(ScrollAreaRadix.Viewport)<{ sx?: SXStyles }>`
  ${({ sx }) => css`
    height: 100%;
    width: 100%;
    ${sx}
  `}
`;

export default ScrollArea;
