'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type React from 'react';
import { isMobile } from 'react-device-detect';
import styled, { css, keyframes } from 'styled-components';
import { createFontStyles } from '../../utils/mixins';
import Box from '../box';
import Stack from '../stack';

export type TooltipProps = TooltipPrimitive.TooltipProps & {
  children: React.ReactElement;
  disabled?: boolean;
  text?: string;
  position?: TooltipPrimitive.TooltipContentProps['side'];
  alignment?: TooltipPrimitive.TooltipContentProps['align'];
  collisionBoundary?: TooltipPrimitive.TooltipContentProps['collisionBoundary'];
  sideOffset?: number;
  ariaLabel?: string;
};
const Tooltip = ({
  children,
  text,
  disabled,
  position = 'top',
  alignment = 'center',
  collisionBoundary,
  open,
  onOpenChange,
  sideOffset = isMobile ? 8 : 4,
  ariaLabel,
}: TooltipProps) => {
  if (disabled) {
    return children;
  }

  if (isMobile) {
    return (
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild aria-label={ariaLabel}>
          <Stack>{children}</Stack>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Content asChild>
          <PopoverPrimitive.Content
            side={position}
            align={alignment}
            sideOffset={sideOffset}
            collisionBoundary={collisionBoundary}
            role="tooltip"
          >
            <Container>{text}</Container>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Root>
    );
  }

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open} onOpenChange={onOpenChange} delayDuration={100}>
        <TooltipPrimitive.Trigger asChild aria-label={ariaLabel}>
          <Stack>{children}</Stack>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side={position}
          align={alignment}
          sideOffset={sideOffset}
          collisionBoundary={collisionBoundary}
          asChild
        >
          <Container>{text}</Container>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Container = styled(Box)`
  ${({ theme }) => css`
    ${createFontStyles('caption-3')}
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
    transform-origin: var(--radix-tooltip-content-transform-origin);
    animation: ${scaleIn} 0.1s ease-out;
    &:focus-visible {
      outline: none;
    }
  `}
`;

export default Tooltip;
