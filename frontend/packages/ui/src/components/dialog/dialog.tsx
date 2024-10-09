import * as RadixDialog from '@radix-ui/react-dialog';
import type React from 'react';
import { forwardRef } from 'react';
import ScrollArea from '../scroll-area';

import type { Icon } from '@onefootprint/icons';
import { AnimatePresence } from 'framer-motion';
import Box from '../box';
import Overlay from '../overlay';
import Container from './container';
import type { DialogButton, DialogLinkButton, DialogSize } from './dialog.types';
import Footer from './footer';
import DialogHeader from './header';

export type DialogProps = {
  onClose: () => void;
  open: boolean;
  children?: React.ReactNode;
  size?: DialogSize;
  title: string;
  isConfirmation?: boolean;
  noPadding?: boolean;
  noScroll?: boolean;
  linkButton?: DialogLinkButton;
  primaryButton?: DialogButton;
  secondaryButton?: DialogButton;
  headerIcon?: {
    component: Icon;
    onClick: () => void;
  };
};

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      children,
      onClose,
      open,
      size = 'default',
      title,
      isConfirmation = false,
      noPadding = false,
      noScroll = false,
      primaryButton,
      secondaryButton,
      linkButton,
      headerIcon,
    },
    ref,
  ) => {
    const hasFooter = primaryButton || secondaryButton || linkButton;

    return (
      <RadixDialog.Root open={open} onOpenChange={onClose} modal={true}>
        <RadixDialog.Portal forceMount>
          {open && (
            <RadixDialog.Overlay asChild>
              <Overlay isVisible={open} isConfirmation={isConfirmation} />
            </RadixDialog.Overlay>
          )}
          <AnimatePresence>
            {open && (
              <Container
                size={size}
                isConfirmation={isConfirmation}
                onClose={onClose}
                ariaLabel={title}
                ref={ref}
                data-has-footer={hasFooter}
              >
                <DialogHeader title={title} onClose={onClose} icon={headerIcon} />
                {noScroll ? (
                  <Box overflow="auto" flex="1">
                    {children}
                  </Box>
                ) : (
                  <ScrollArea
                    padding={noPadding ? 0 : 7}
                    hideTopLine
                    hideBottomLine={size === 'full-screen' || !hasFooter}
                  >
                    {children}
                  </ScrollArea>
                )}
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
          </AnimatePresence>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    );
  },
);

export default Dialog;
