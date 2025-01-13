import type { Icon } from '@onefootprint/icons';
import * as RadixDialog from '@radix-ui/react-dialog';
import { cx } from 'class-variance-authority';
import type React from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';
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
    const contentRef = useRef<HTMLDivElement>(null);
    const [hasScroll, setHasScroll] = useState(false);

    useEffect(() => {
      const checkScroll = () => {
        if (contentRef.current) {
          const { scrollHeight, clientHeight, scrollTop } = contentRef.current;
          const hasMoreContent = scrollHeight > clientHeight;
          const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
          setHasScroll(hasMoreContent && !isAtBottom);
        }
      };

      const contentElement = contentRef.current;
      if (contentElement) {
        checkScroll();

        contentElement.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        const observer = new ResizeObserver(checkScroll);
        observer.observe(contentElement);

        return () => {
          contentElement.removeEventListener('scroll', checkScroll);
          window.removeEventListener('resize', checkScroll);
          observer.disconnect();
        };
      }
    }, [children, open]);

    return (
      <RadixDialog.Root open={open} onOpenChange={onClose} modal={true}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay asChild>
            <Overlay isVisible={open} isConfirmation={isConfirmation} />
          </RadixDialog.Overlay>
          <Container
            aria-label={title}
            aria-describedby={undefined}
            isConfirmation={isConfirmation}
            onClose={onClose}
            onEscapeKeyDown={onEscapeKeyDown}
            preventEscapeKeyDown={preventEscapeKeyDown}
            ref={ref}
            size={size}
            open={open}
          >
            <DialogHeader title={title} onClose={onClose} icon={headerIcon} />
            <div
              ref={contentRef}
              className={cx('flex-1 overflow-auto min-h-0', {
                'p-0': noPadding,
                'p-6': !noPadding,
                'overflow-hidden': noScroll,
              })}
            >
              {children}
            </div>
            {hasFooter && (
              <Footer
                primaryButton={primaryButton}
                secondaryButton={secondaryButton}
                linkButton={linkButton}
                size={size}
                hasScroll={hasScroll}
              />
            )}
          </Container>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    );
  },
);

export default Dialog;
