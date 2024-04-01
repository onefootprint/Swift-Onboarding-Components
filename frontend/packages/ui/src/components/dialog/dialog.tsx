import * as DialogPrimitive from '@radix-ui/react-dialog';
import React, { useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';

import Overlay from '../overlay';
import ScrollArea from '../scroll-area';
import type { DialogProps, DialogSize } from './dialog.types';
import {
  useDialogPosition,
  useDialogSize,
  useDialogZIndex,
} from './dialog.utils';
import DialogFooter from './dialog-footer';
import DialogHeader from './dialog-header';

const Dialog = ({
  children,
  onClose,
  open,
  size = 'default',
  title,
  isConfirmation = false,
  disableResponsiveness = false,
  headerIcon,
  primaryButton,
  secondaryButton,
  linkButton,
  ariaLabel,
}: DialogProps) => {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
    }
  };

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        document.body.style.pointerEvents = '';
      }, 500);
    }
  }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogContent
          isConfirmation={isConfirmation}
          size={size}
          disableResponsiveness={disableResponsiveness}
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
          aria-label={ariaLabel || title}
          role="dialog"
        >
          <DialogHeader
            title={title}
            headerIcon={headerIcon}
            onClose={onClose}
          />
          <ScrollArea padding={7}>{children}</ScrollArea>
          <DialogFooter
            primaryButton={primaryButton}
            secondaryButton={secondaryButton}
            linkButton={linkButton}
          />
        </DialogContent>
        <DialogPrimitive.Overlay asChild>
          <Overlay isVisible={open} />
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

const DialogContent = styled(DialogPrimitive.Content)<{
  isConfirmation?: boolean;
  size: DialogSize;
  disableResponsiveness?: boolean;
}>`
  ${({ isConfirmation, size, theme, disableResponsiveness }) => css`
    display: flex;
    flex-direction: column;
    position: fixed;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[3]};
    z-index: 1000;
    ${useDialogSize(size, disableResponsiveness, isConfirmation)};
    ${useDialogPosition(size, isConfirmation)};
    ${useDialogZIndex(isConfirmation)};

    &[data-state='open'] {
      animation: ${enter} 0.2s ease-in;
    }

    &[data-state='closed'] {
      animation: ${leave} 0.2s ease-out;
    }
  `}
`;

const enter = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const leave = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export default Dialog;
