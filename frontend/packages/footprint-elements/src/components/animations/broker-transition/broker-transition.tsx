import { Typography } from '@onefootprint/ui';
import RiveComponent from '@rive-app/react-canvas';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

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

type BrokerTransitionProps = {
  src: string;
  firstText: string;
  secondText: string;
};

const BrokerTransition = ({
  src,
  firstText,
  secondText,
}: BrokerTransitionProps) => (
  <AnimationWrapper>
    <CanvasWrapper>
      <RiveComponent src={src} />
    </CanvasWrapper>
    <motion.div
      animate="finish"
      variants={textAnimationVariants}
      initial="initial"
    >
      <Typography variant="label-2">{firstText}</Typography>
    </motion.div>
    <motion.div
      animate="finish"
      variants={secondTextAnimationVariants}
      initial="initial"
    >
      <Typography variant="label-2">{secondText}</Typography>
    </motion.div>
  </AnimationWrapper>
);

const AnimationWrapper = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
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
export default BrokerTransition;
