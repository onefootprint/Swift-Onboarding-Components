import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

type WaveAnimationProps = {
  width: number;
};

const WaveAnimation = ({ width }: WaveAnimationProps) => (
  <>
    <Wave
      initial={{
        opacity: 0.2,
        width: 0,
        height: 0,
      }}
      animate={{
        opacity: 0,
        width,
        height: width,
        transitionEnd: {
          display: 'none',
        },
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
    <Wave
      initial={{
        opacity: 0.2,
        width: 0,
        height: 0,
      }}
      animate={{
        opacity: 0,
        width,
        height: width,
        transitionEnd: {
          display: 'none',
        },
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeOut',
        delay: 3,
      }}
    />
  </>
);

const Wave = styled(motion.span)`
  ${({ theme }) => css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: ${theme.borderRadius.full};
    background: ${theme.color.accent};
    z-index: -1;
    pointer-events: none;
    user-select: none;
  `}
`;

export default WaveAnimation;
