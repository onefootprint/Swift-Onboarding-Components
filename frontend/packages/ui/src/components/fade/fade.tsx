import { AnimatePresence, motion } from 'framer-motion';
import type { AriaRole } from 'react';
import React, { forwardRef } from 'react';

type FadeProps = {
  'aria-label'?: string;
  children: React.ReactNode;
  className?: string;
  from: 'left' | 'right' | 'top' | 'bottom' | 'center';
  isVisible: boolean;
  role?: AriaRole;
  testID?: string;
  to: 'left' | 'right' | 'top' | 'bottom' | 'center';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const Fade = forwardRef<HTMLDivElement, FadeProps>(
  ({ 'aria-label': ariaLabel, children, className, from, isVisible, role, testID, to, onClick }, ref) => {
    let initialX = 0;
    let initialY = 0;
    let finalX = 0;
    let finalY = 0;

    switch (from) {
      case 'left':
        initialX = -10;
        initialY = 0;
        break;
      case 'right':
        initialX = 10;
        initialY = 0;
        break;
      case 'top':
        initialY = -10;
        initialX = 0;
        break;
      case 'bottom':
        initialY = 10;
        initialX = 0;
        break;
      case 'center':
        initialX = 0;
        initialY = 0;
        break;
      default:
        initialX = 0;
        initialY = 0;
    }

    switch (to) {
      case 'left':
        finalX = -10;
        finalY = 0;
        break;
      case 'right':
        finalX = 10;
        finalY = 0;
        break;
      case 'top':
        finalY = -10;
        finalX = 0;
        break;
      case 'bottom':
        finalY = 10;
        finalX = 0;
        break;
      case 'center':
        finalX = 0;
        finalY = 0;
        break;
      default:
        finalX = 0;
        finalY = 0;
    }

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            onClick={onClick}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            aria-label={ariaLabel}
            className={className}
            data-testid={testID}
            exit={{ opacity: 0, x: finalX, y: finalY, scale: 0.98 }}
            initial={{ opacity: 0.5, x: initialX, y: initialY, scale: 0.98 }}
            ref={ref}
            role={role}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

export default Fade;
