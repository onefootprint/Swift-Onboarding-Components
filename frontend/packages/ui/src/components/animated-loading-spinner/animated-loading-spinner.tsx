import type { Color } from '@onefootprint/design-tokens';
import React from 'react';
import styled, { keyframes, useTheme } from 'styled-components';

import Stack from '../stack';

export type AnimatedLoadingSpinnerProps = {
  animationStart: boolean;
  size?: number;
  color?: Color;
  ariaLabel?: string;
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
    <Container $height={size} $width={size} align="center" justify="center" aria-label={ariaLabel} role="progressbar">
      {animationStart && (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color ? theme.backgroundColor.transparent : theme.backgroundColor.secondary}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={spinnerColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            $circumference={adjustedCircumference}
          />
        </svg>
      )}
    </Container>
  );
};

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const dash = (size: number) => keyframes`
  0% {
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dashoffset: ${size / 3};
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const Container = styled(Stack)<{ $height: number; $width: number }>`
  ${({ $height, $width }) => `
      height: ${$height}px;
      width: ${$width}px;
      display: flex; 
      justify-content: center;
      align-items: center; 
  `}
`;

const AnimatedCircle = styled.circle<{ $circumference: number }>`
  animation: ${rotate} 2s linear infinite, ${({ $circumference }) => dash($circumference)} 2s ease-in-out infinite;
  stroke-dasharray: ${({ $circumference }) => $circumference};
  stroke-dashoffset: 0;
  transform-origin: center;
`;

export default AnimatedLoadingSpinner;
