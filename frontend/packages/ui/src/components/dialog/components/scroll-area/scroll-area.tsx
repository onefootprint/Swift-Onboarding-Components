import * as ScrollAreaRadix from '@radix-ui/react-scroll-area';
import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useEventListener } from 'usehooks-ts';

type ScrollAreaProps = {
  children: React.ReactNode;
};

const ScrollArea = ({ children }: ScrollAreaProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollAreaHeight, setScrollAreaHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [showLine, setShowLine] = useState(true);

  const noOverflow = viewportHeight <= scrollAreaHeight;
  const scrolledToBottom =
    scrollTop > 0 && scrollTop + scrollAreaHeight >= viewportHeight;

  const updateDimensions = () => {
    setScrollAreaHeight(scrollAreaRef.current?.clientHeight ?? 0);
    setViewportHeight(viewportRef.current?.clientHeight ?? 0);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (noOverflow) {
      setShowLine(false);
    } else {
      setShowLine(!scrolledToBottom);
    }
  }, [noOverflow, scrolledToBottom]);

  useEventListener('resize', updateDimensions);

  return (
    <StyledRoot
      ref={scrollAreaRef}
      data-line={showLine}
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
