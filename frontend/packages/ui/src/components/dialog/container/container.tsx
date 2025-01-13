import * as RadixDialog from '@radix-ui/react-dialog';
import type { DialogContentProps } from '@radix-ui/react-dialog';
import { cx } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef } from 'react';
import type { DialogSize } from '../dialog.types';

type ContainerProps = {
  dataTestId?: string;
  isConfirmation: boolean;
  onClose: () => void;
  size: DialogSize;
  open: boolean;
  preventEscapeKeyDown?: boolean;
} & DialogContentProps;

const getContainerStyles = ({ size, isConfirmation }: { size: DialogSize; isConfirmation: boolean }) => {
  const baseStyles = [
    'fixed flex flex-col left-1/2 -translate-x-1/2',
    'bg-primary shadow-lg isolate overflow-visible',
    'border border-tertiary border-solid rounded',
  ];

  const sizeStyles = {
    'full-screen': 'w-[calc(100vw-24px)] h-[calc(100vh-24px)] top-1/2 -translate-y-1/2 shadow-md',
    default: 'w-[650px] max-w-[calc(100vw-32px)]',
    compact: 'w-[500px] max-w-[calc(100vw-32px)]',
  };

  const conditionalStyles = {
    'max-h-[calc(100vh-48px)]': size !== 'full-screen',
    'z-confirmationDialog top-1/2 -translate-y-1/2': isConfirmation,
    'z-dialog': !isConfirmation,
    'top-6': !isConfirmation && size !== 'full-screen',
    [sizeStyles[size]]: true,
  };

  return cx(baseStyles, conditionalStyles);
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    { children, onEscapeKeyDown, onClose, dataTestId, size, isConfirmation, preventEscapeKeyDown, open, ...props },
    ref,
  ) => {
    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (preventEscapeKeyDown) {
        event.preventDefault();
      } else if (onEscapeKeyDown) {
        onEscapeKeyDown(event);
      } else {
        onClose();
      }
    };

    return (
      <AnimatePresence>
        {open && (
          <RadixDialog.Content
            {...props}
            onPointerDownOutside={onClose}
            onEscapeKeyDown={handleEscapeKeyDown}
            data-testid={dataTestId}
            ref={ref}
            asChild
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 0.2,
                  ease: 'easeInOut',
                },
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.2,
                  ease: 'easeInOut',
                },
              }}
              className={getContainerStyles({ size, isConfirmation })}
            >
              {children}
            </motion.div>
          </RadixDialog.Content>
        )}
      </AnimatePresence>
    );
  },
);

export default Container;
