import type { Icon } from '@onefootprint/icons';
import * as RadixDialog from '@radix-ui/react-dialog';
import { AnimatePresence } from 'framer-motion';
import type React from 'react';
import { forwardRef } from 'react';
import ScrollArea from '../scroll-area';

import Box from '../box';
import Overlay from '../overlay';
import Container from './container';
import type { DialogButton, DialogLinkButton, DialogSize } from './dialog.types';
import Footer from './footer';
import DialogHeader from './header';

export type DialogProps = {
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: DialogSize;
  primaryButton?: DialogButton;
  secondaryButton?: DialogButton;
  linkButton?: DialogLinkButton;
  isConfirmation?: boolean;
  noPadding?: boolean;
  noScroll?: boolean;
  preventEscapeKeyDown?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  headerIcon?: {
    component: Icon;
    onClick: () => void;
  };
};

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      children,
      open,
      onClose,
      title,
      size = 'default',
      primaryButton,
      secondaryButton,
      linkButton,
      isConfirmation = false,
      noPadding = false,
      noScroll = false,
      preventEscapeKeyDown,
      onEscapeKeyDown,
      headerIcon,
    },
    ref,
  ) => {
    const hasFooter = primaryButton || secondaryButton || linkButton;

    return (
      <AnimatePresence>
        <RadixDialog.Root open={open} onOpenChange={onClose} modal={true}>
          <RadixDialog.Portal forceMount>
            {open && (
              <RadixDialog.Overlay asChild>
                <Overlay isVisible={open} isConfirmation={isConfirmation} />
              </RadixDialog.Overlay>
            )}
            {open && (
              <Container
                aria-label={title}
                aria-describedby={undefined}
                data-has-footer={hasFooter}
                isConfirmation={isConfirmation}
                onClose={onClose}
                onEscapeKeyDown={onEscapeKeyDown}
                preventEscapeKeyDown={preventEscapeKeyDown}
                ref={ref}
                size={size}
              >
                <DialogHeader title={title} onClose={onClose} icon={headerIcon} />
                <Box overflow="auto" flex="1">
                  {noScroll ? (
                    children
                  ) : (
                    <ScrollArea
                      height="100%"
                      padding={noPadding ? 0 : 7}
                      hideTopLine
                      hideBottomLine={size === 'full-screen' || !hasFooter}
                    >
                      {children}
                    </ScrollArea>
                  )}
                </Box>
                {hasFooter && (
                  <Footer
                    primaryButton={primaryButton}
                    secondaryButton={secondaryButton}
                    linkButton={linkButton}
                    size={size}
                  />
                )}
              </Container>
            )}
          </RadixDialog.Portal>
        </RadixDialog.Root>
      </AnimatePresence>
    );
  },
);

export default Dialog;
