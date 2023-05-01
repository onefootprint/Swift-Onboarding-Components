import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

type OverlayProps = {
  isVisible?: boolean;
  className?: string;
};

const Overlay = ({ isVisible = true, className }: OverlayProps) => (
  <AnimatePresence>
    {isVisible ? (
      <OverlayLayer
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.2, ease: 'easeInOut' },
        }}
        exit={{ opacity: 0 }}
        className={className}
      />
    ) : null}
  </AnimatePresence>
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
