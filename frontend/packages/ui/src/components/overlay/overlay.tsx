import styled, { css } from '@onefootprint/styled';
import { AnimatePresence, motion } from 'framer-motion';
import React, { forwardRef } from 'react';

type OverlayProps = {
  isVisible?: boolean;
  className?: string;
};

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ isVisible = false, className }: OverlayProps, ref) => (
    <AnimatePresence>
      {isVisible && (
        <OverlayLayer
          ref={ref}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={className}
        />
      )}
    </AnimatePresence>
  ),
);

const OverlayLayer = styled(motion.div)`
  ${({ theme }) => css`
    position: fixed;
    background: rgba(0, 0, 0, 0.3);
    height: 100vh;
    width: 100vw;
    left: 0;
    top: 0;
    user-select: none;
    z-index: ${theme.zIndex.overlay};
  `}
`;

export default Overlay;
