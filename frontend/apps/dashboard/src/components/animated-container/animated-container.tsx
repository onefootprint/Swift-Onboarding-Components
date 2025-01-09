import type { BoxProps } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';

type AnimatedContainerProps = BoxProps & {
  isExpanded: boolean;
  children: React.ReactNode;
  className?: string;
};

const AnimatedContainer = ({ isExpanded, children, className }: AnimatedContainerProps) => {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedContainer;
