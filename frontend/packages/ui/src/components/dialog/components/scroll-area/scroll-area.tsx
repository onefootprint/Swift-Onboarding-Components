import * as ScrollAreaRadix from '@radix-ui/react-scroll-area';
import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

type ScrollAreaProps = {
  children: React.ReactNode;
};

const SCROLL_ERROR_MARGIN = 16;

const ScrollArea = ({ children }: ScrollAreaProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollAreaHeight, setScrollAreaHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [showLine, setShowLine] = useState(true);

  useEffect(() => {
    if (viewportRef.current && scrollAreaRef.current) {
      setViewportHeight(viewportRef.current.clientHeight);
      setScrollAreaHeight(scrollAreaRef.current.clientHeight);
    }
  }, [viewportRef, scrollAreaRef]);

  useEffect(() => {
    function handleResize() {
      if (viewportRef.current && scrollAreaRef.current) {
        setViewportHeight(viewportRef.current.clientHeight);
        setScrollAreaHeight(scrollAreaRef.current.clientHeight);
      }
    }
    window.addEventListener('resize', handleResize);
  });

  useEffect(() => {
    if (!viewportRef.current || !scrollAreaRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      setViewportHeight(viewportRef.current!.clientHeight);
      setScrollAreaHeight(scrollAreaRef.current!.clientHeight);
    });
    resizeObserver.observe(viewportRef.current);
    resizeObserver.observe(scrollAreaRef.current);
    resizeObserver.disconnect();
  }, [viewportRef, scrollAreaRef]);

  useEffect(() => {
    if (!viewportRef.current || !scrollAreaRef.current) return;
    const observer = new MutationObserver(() => {
      setViewportHeight(viewportRef.current!.clientHeight);
      setScrollAreaHeight(scrollAreaRef.current!.clientHeight);
    });
    observer.observe(viewportRef.current, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    observer.disconnect();
  }, [viewportRef, scrollAreaRef]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setShowLine(
      viewportHeight - scrollAreaHeight >= scrollTop + SCROLL_ERROR_MARGIN,
    );
  };

  return (
    <StyledRoot
      ref={scrollAreaRef}
      data-line={viewportHeight !== scrollAreaHeight && showLine}
      onScroll={handleScroll}
    >
      <StyledViewport asChild ref={viewportRef}>
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

const StyledViewport = styled(ScrollAreaRadix.Viewport)`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]};
    height: 100%;
    width: 100%;
  `}
`;

export default ScrollArea;
