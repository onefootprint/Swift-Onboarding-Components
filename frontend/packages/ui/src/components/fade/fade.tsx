import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

type FadeProps = {
  children: React.ReactNode;
  isVisible: boolean;
  from: 'left' | 'right' | 'top' | 'bottom' | 'center';
  to: 'left' | 'right' | 'top' | 'bottom' | 'center';
};

const Fade = ({ children, isVisible, from, to }: FadeProps) => {
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
          initial={{ opacity: 0, x: initialX, y: initialY }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: finalX, y: finalY }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Fade;
