import styled, { css } from '@onefootprint/styled';
import * as ScrollAreaRadix from '@radix-ui/react-scroll-area';
import React, { useEffect, useRef, useState } from 'react';

import { SXStyleProps, SXStyles, useSX } from '../../hooks';

type ScrollAreaProps = {
  children: React.ReactNode;
  sx?: SXStyleProps;
};

const ScrollArea = ({ children, sx }: ScrollAreaProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollAreaHeight, setScrollAreaHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [showLine, setShowLine] = useState(true);

  const noOverflow = viewportHeight <= scrollAreaHeight;
  const scrolledToBottom =
    scrollTop > 0 && scrollTop + scrollAreaHeight >= viewportHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const sxStyles = useSX(sx);

  useEffect(() => {
    if (noOverflow) {
      setShowLine(false);
    } else {
      setShowLine(!scrolledToBottom);
    }
  }, [noOverflow, scrolledToBottom]);

  useEffect(() => {
    const updateDimensions = () => {
      setScrollAreaHeight(scrollAreaRef.current?.clientHeight ?? 0);
      setViewportHeight(viewportRef.current?.clientHeight ?? 0);
    };

    const startResizeObserve = () => {
      if (viewportRef.current)
        new ResizeObserver(updateDimensions).observe(viewportRef.current);
    };

    const stopResizeObserve = () => {
      if (viewportRef.current)
        new ResizeObserver(updateDimensions).unobserve(viewportRef.current);
    };

    startResizeObserve();

    return stopResizeObserve;
  }, []);

  return (
    <StyledRoot
      ref={scrollAreaRef}
      data-line={showLine}
      onScroll={handleScroll}
    >
      <StyledViewport sx={sxStyles} asChild ref={viewportRef}>
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

    &[data-line='false'] {
      border-bottom: ${theme.borderWidth[1]} solid
        ${theme.borderColor.transparent};
    }

    &[data-line='true'] {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
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
