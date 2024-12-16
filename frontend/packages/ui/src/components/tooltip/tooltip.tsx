'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import type React from 'react';
import { useState } from 'react';

export type TooltipProps = TooltipPrimitive.TooltipProps & {
  children: React.ReactElement;
  disabled?: boolean;
  text?: string;
  position?: TooltipPrimitive.TooltipContentProps['side'];
  alignment?: TooltipPrimitive.TooltipContentProps['align'];
  collisionBoundary?: TooltipPrimitive.TooltipContentProps['collisionBoundary'];
  sideOffset?: TooltipPrimitive.TooltipContentProps['sideOffset'];
  ariaLabel?: TooltipPrimitive.TooltipTriggerProps['aria-label'];
  asChild?: TooltipPrimitive.TooltipTriggerProps['asChild'];
};

type TooltipContentProps = {
  children: React.ReactNode;
  side: TooltipPrimitive.TooltipContentProps['side'];
};

const getAnimationProps = (side: TooltipPrimitive.TooltipContentProps['side']) => {
  const animations = {
    top: {
      initial: { opacity: 0.5, y: 2, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
    },
    bottom: {
      initial: { opacity: 0.5, y: -2, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
    },
    left: {
      initial: { opacity: 0.5, x: 2, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
    },
    right: {
      initial: { opacity: 0.5, x: -2, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
    },
  };
  return animations[side || 'top'];
};

const TooltipContent = ({ children, side }: TooltipContentProps) => {
  const animation = getAnimationProps(side);

  return (
    <motion.div
      className="min-w-fit w-fit max-w-[300px] px-2 py-1 text-caption-3 text-quinary text-left rounded-sm bg-tertiary shadow-md will-change-opacity"
      initial={animation.initial}
      animate={animation.animate}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

const Tooltip = ({
  children,
  text,
  disabled,
  position = 'top',
  alignment = 'center',
  collisionBoundary,
  sideOffset = 4,
  ariaLabel,
  asChild,
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (disabled || !text) {
    return children;
  }

  const handleHover = () => {
    setIsOpen(true);
  };

  const handleLeave = () => {
    setIsOpen(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <TooltipPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <TooltipPrimitive.Trigger
          aria-label={ariaLabel}
          onClick={handleClick}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
          asChild={asChild}
        >
          {children}
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Content
          side={position}
          align={alignment}
          sideOffset={sideOffset}
          collisionBoundary={collisionBoundary}
          asChild
        >
          <TooltipContent side={position}>{text}</TooltipContent>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip;
