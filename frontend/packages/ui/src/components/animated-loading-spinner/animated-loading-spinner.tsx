import type { Color } from '@onefootprint/design-tokens';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import styled, { useTheme } from 'styled-components';

import Stack from '../stack';

export type AnimatedLoadingSpinnerProps = {
  animationStart: boolean;
  size?: number;
  color?: Color;
  ariaLabel?: string;
};

const spinnerVariants = {
  animate: {
    strokeDashoffset: [
      -180, -210, -240, -270, -300, -330, -360, -390, -420, -450, -480, -510,
      -540, -570, -600, -630, -660, -690, -720, 0, -30, -60, -90, -120, -150,
      -180,
    ],
    rotate: [0, 360],
    transition: {
      strokeDashoffset: {
        repeat: Infinity,
        duration: 20,
        ease: 'linear',
      },
      rotate: {
        repeat: Infinity,
        duration: 4,
        ease: 'linear',
      },
    },
  },
  initial: {
    strokeDashoffset: 0,
    rotate: 0,
  },
};

const AnimatedLoadingSpinner = ({
  animationStart = true,
  size = 32,
  color,
  ariaLabel = 'Loading...',
}: AnimatedLoadingSpinnerProps) => {
  const theme = useTheme();
  const spinnerColor = color ? theme.color[color] : theme.color.quaternary;

  const scale = size / 40;
  const strokeWidth = 3.5 * scale;
  const radius = (size - strokeWidth) / 3;
  const circumference = radius * 2 * Math.PI;
  const adjustedCircumference = circumference * 0.75;

  return (
    <Container
      $height={size}
      $width={size}
      align="center"
      justify="center"
      aria-label={ariaLabel}
      role="progressbar"
    >
      <AnimatePresence>
        {animationStart && (
          <motion.svg
            initial="initial"
            animate="animate"
            exit="initial"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={
                color
                  ? theme.backgroundColor.transparent
                  : theme.backgroundColor.secondary
              }
              strokeWidth={strokeWidth}
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={spinnerColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              variants={spinnerVariants}
              style={{
                pathLength: 1,
                pathOffset: 0.5,
                strokeDasharray: adjustedCircumference,
              }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </Container>
  );
};

const Container = styled(Stack)<{ $height: number; $width: number }>`
  ${({ $height, $width }) => `
        height: ${$height}px;
        width: ${$width}px;
        display: flex; 
        justify-content: center;
        align-items: center; 
    `}
`;

export default AnimatedLoadingSpinner;
