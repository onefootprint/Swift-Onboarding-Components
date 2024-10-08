import * as RadixDialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import styled, { css, useTheme } from 'styled-components';
import media from 'styled-media-query';
import { FULL_SCREEN_PADDING, TOP_PADDING } from '../dialog.constants';
import type { DialogSize } from '../dialog.types';

interface ContainerProps {
  children: React.ReactNode;
  onClose: () => void;
  ariaDescribedBy?: string;
  ariaLabel: string;
  dataTestId?: string;
  size: DialogSize;
  isConfirmation: boolean;
}

const dialogAppearVariants = (isConfirmation: boolean, size: DialogSize) => {
  const theme = useTheme();
  const yPosition = isConfirmation
    ? { initial: '40%', animate: '50%', exit: '40%' }
    : {
        initial: `${size === 'full-screen' ? `calc(${theme.spacing[FULL_SCREEN_PADDING]} + 40px)` : '10%'}`,
        animate: `${theme.spacing[size === 'full-screen' ? FULL_SCREEN_PADDING : TOP_PADDING]}`,
        exit: `${size === 'full-screen' ? `calc(${theme.spacing[FULL_SCREEN_PADDING]} + 40px)` : '10%'}`,
      };

  return {
    initial: {
      opacity: 0,
      scale: 0.95,
      left: '50%',
      x: '-50%',
      y: yPosition.initial,
    },
    animate: {
      opacity: 1,
      scale: 1,
      left: '50%',
      x: '-50%',
      y: yPosition.animate,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: yPosition.exit,
      transition: {
        duration: 0.1,
        ease: 'easeInOut',
      },
    },
  };
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, onClose, ariaDescribedBy, ariaLabel, dataTestId, size, isConfirmation }, ref) => (
    <RadixDialog.Content
      onPointerDownOutside={onClose}
      onEscapeKeyDown={onClose}
      aria-describedby={ariaDescribedBy}
      ref={ref}
      asChild
    >
      <DialogContainer
        $isConfirmation={isConfirmation}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        aria-describedby={ariaDescribedBy}
        ref={ref}
        size={size}
        variants={dialogAppearVariants(isConfirmation, size)}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </DialogContainer>
    </RadixDialog.Content>
  ),
);

const DialogContainer = styled(motion.div)<{
  size: DialogSize;
  $isConfirmation: boolean;
}>`
  ${({ theme, size, $isConfirmation }) => css`
    display: grid;
    grid-template-rows: auto 1fr auto;
    position: fixed;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    box-shadow: ${theme.elevation[2]};
    z-index: ${$isConfirmation ? theme.zIndex.confirmationDialog : theme.zIndex.dialog};
    box-sizing: border-box;
    isolation: isolate;
    top: 0;
    right: 0;

    &:focus-visible {
      outline: none;
    }

    ${
      size === 'full-screen'
        ? css`
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: none;
          border-radius: 0;
          box-shadow: none;

          ${media.greaterThan('small')`
            width: calc(100dvw - ${theme.spacing[FULL_SCREEN_PADDING]} * 2);
            height: calc(100dvh - ${theme.spacing[FULL_SCREEN_PADDING]} * 2);
            border-radius: ${theme.borderRadius.default};
            box-shadow: ${theme.elevation[2]};  
          `}
        `
        : css`
          width: ${size === 'compact' ? '500px' : '650px'};
          max-width: calc(100dvw - ${theme.spacing[3]} * 2);
          max-height: calc(100dvh - ${theme.spacing[TOP_PADDING]} * 2);
        `
    }
  `}
`;

export default Container;
