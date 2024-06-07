'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';

export type TooltipProps = {
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  alignment?: 'start' | 'center' | 'end';
  text?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  sideOffset?: number;
};

const Tooltip = ({
  children,
  text,
  position = 'top',
  alignment = 'center',
  disabled,
  open: controlledOpen,
  onOpenChange,
  sideOffset = 4,
}: TooltipProps) => {
  const controlled = typeof controlledOpen === 'boolean';
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlled ? controlledOpen : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root
        delayDuration={0}
        open={controlled ? controlledOpen : open}
        onOpenChange={handleOpenChange}
      >
        <TooltipPrimitive.Trigger
          onMouseEnter={() => handleOpenChange(true)}
          onMouseLeave={() => handleOpenChange(false)}
          onPointerEnter={() => handleOpenChange(true)}
          onPointerLeave={() => handleOpenChange(false)}
          onTouchStart={() => handleOpenChange(!open)}
          onClick={() => handleOpenChange(!open)}
          asChild
        >
          <TriggerContainer data-tooltip-trigger>{children}</TriggerContainer>
        </TooltipPrimitive.Trigger>
        {(open || controlledOpen) && !disabled ? (
          <TooltipContainer side={position} align={alignment} sideOffset={sideOffset}>
            {text}
          </TooltipContainer>
        ) : null}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

const TooltipContainer = styled(TooltipPrimitive.Content)`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    background: ${theme.backgroundColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    color: ${theme.color.quinary};
    max-width: 300px;
    min-width: fit-content;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    text-align: left;
    z-index: ${theme.zIndex.tooltip};
    will-change: opacity;
    text-transform: initial;
    text-wrap: wrap;

    &[data-state='open'],
    &[data-state='delayed-open'],
    &[data-state='instant-open'] {
      animation-name: ${fadeIn};
      animation-duration: 0.2s;
      animation-timing-function: ease-out;
    }
  `}
`;

const TriggerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  max-width: 100%;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export default Tooltip;
