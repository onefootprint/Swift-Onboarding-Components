import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

type OverlayProps = {
  isVisible?: boolean;
};

const Overlay = ({ isVisible = true }: OverlayProps) => (
  <AnimatePresence>
    {isVisible ? (
      <OverlayLayer
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.2, ease: 'easeInOut' },
        }}
        exit={{ opacity: 0 }}
      />
    ) : null}
  </AnimatePresence>
);

const OverlayLayer = styled(motion.div)`
  ${({ theme }) => css`
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: ${theme.zIndex.overlay};
    user-select: none;
  `}
`;

export default Overlay;
