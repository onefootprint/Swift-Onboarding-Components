import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';

export type TooltipProps = {
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  alignment?: 'start' | 'center' | 'end';
  text?: string;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
};

const Tooltip = ({
  children,
  text,
  position = 'top',
  alignment = 'center',
  disabled,

  onOpenChange,
}: TooltipProps) => {
  const [open, setOpen] = useState(false);

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root
        delayDuration={0}
        open={open}
        onOpenChange={onOpenChange}
      >
        <TooltipPrimitive.Trigger
          onMouseEnter={() => !disabled && setOpen(true)}
          onMouseLeave={() => {
            setOpen(false);
          }}
          onPointerEnter={() => !disabled && setOpen(true)}
          onPointerLeave={() => setOpen(false)}
          onMouseOver={() => !disabled && setOpen(true)}
          onClick={() => !disabled && setOpen(true)}
          onTouchEnd={() => !disabled && setOpen(!open)}
          asChild
        >
          <TriggerContainer>{children}</TriggerContainer>
        </TooltipPrimitive.Trigger>
        {open ? (
          <TooltipPrimitive.Portal forceMount>
            <TooltipContainer
              side={position}
              align={alignment}
              sideOffset={8}
              forceMount
            >
              {text}
            </TooltipContainer>
          </TooltipPrimitive.Portal>
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
    text-align: center;
    z-index: ${theme.zIndex.tooltip};
    will-change: opacity;

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
