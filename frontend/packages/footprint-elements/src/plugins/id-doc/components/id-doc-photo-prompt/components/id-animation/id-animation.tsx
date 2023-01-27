import { Typography } from '@onefootprint/ui';
import RiveComponent from '@rive-app/react-canvas';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

const iconAnimationVariants = {
  initial: {
    opacity: 1,
  },
  finish: {
    opacity: 0,
    transition: {
      delay: 4,
      duration: 0.1,
      type: 'easeOut',
    },
  },
};

const textAnimationVariants = {
  initial: {
    opacity: 1,
  },
  finish: {
    opacity: 0,
    display: 'none',
    transition: {
      delay: 2.2,
      duration: 0.2,
    },
  },
};

const secondTextAnimationVariants = {
  initial: {
    opacity: 0,
    display: 'none',
  },
  finish: {
    opacity: 1,
    display: 'block',
    transition: {
      delay: 2.2,
      duration: 0.2,
    },
  },
};

const canvasAnimationVariants = {
  initial: {
    y: 0,
    scale: 1,
  },
  finish: {
    y: -332,
    scale: 0.85,
    transition: {
      delay: 3.2,
      duration: 0.8,
      type: 'easeOut',
    },
  },
};

const IdAnimation = () => (
  <AnimationWrapper
    animate="finish"
    initial="initial"
    variants={iconAnimationVariants}
  >
    <CanvasWrapper
      animate="finish"
      variants={canvasAnimationVariants}
      initial="initial"
    >
      <RiveComponent src="/id-animation/id-animation.riv" />
    </CanvasWrapper>
    <motion.div
      animate="finish"
      variants={textAnimationVariants}
      initial="initial"
    >
      <Typography variant="label-2">Front image uploaded</Typography>
    </motion.div>
    <motion.div
      animate="finish"
      variants={secondTextAnimationVariants}
      initial="initial"
    >
      <Typography variant="label-2">Now the back side</Typography>
    </motion.div>
  </AnimationWrapper>
);

const AnimationWrapper = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    background-color: ${theme.backgroundColor.primary};
  `}
`;

const CanvasWrapper = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 120px;
`;
export default IdAnimation;
