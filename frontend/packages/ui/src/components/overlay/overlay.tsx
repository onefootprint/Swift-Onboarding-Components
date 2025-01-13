import { cx } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';

type OverlayProps = {
  isVisible?: boolean;
  isConfirmation?: boolean;
};

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ isVisible, isConfirmation = false }: OverlayProps, ref: ForwardedRef<HTMLDivElement>) => {
    if (!isVisible) return null;

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2, ease: 'easeInOut' } }}
            exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeInOut' } }}
            ref={ref}
            className={cx(
              'fixed inset-0 h-screen w-screen select-none bg-primary/20 backdrop-blur-[2px]',
              isConfirmation ? 'z-confirmationOverlay' : 'z-overlay',
            )}
          />
        )}
      </AnimatePresence>
    );
  },
);

export default Overlay;
