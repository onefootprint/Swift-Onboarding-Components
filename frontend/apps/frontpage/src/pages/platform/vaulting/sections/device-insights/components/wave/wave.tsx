import { motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';

type WaveProps = {
  initialDiameter: number;
  finalDiameter: number;
  duration: number;
  delay: number;
  $zIndex?: number;
};

const Wave = ({ initialDiameter, finalDiameter, duration, delay, $zIndex }: WaveProps) => (
  <WaveContainer
    initial={{
      width: initialDiameter,
      height: initialDiameter,
      opacity: 0,
      zIndex: $zIndex,
    }}
    animate={{
      width: finalDiameter,
      height: finalDiameter,
      opacity: [0, 1, 0],
      zIndex: $zIndex,
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
    }}
  />
);

const WaveContainer = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  position: absolute;
`;

export default Wave;
