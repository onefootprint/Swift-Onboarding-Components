import styled, { css, keyframes } from '@onefootprint/styled';
import React from 'react';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';

export type ShimmerProps = {
  'aria-hidden'?: boolean;
  'aria-valuetext'?: string;
  sx?: SXStyleProps;
  testID?: string;
};

const Shimmer = ({
  'aria-hidden': ariaHidden,
  testID,
  sx,
  'aria-valuetext': ariaValueText = 'Loading...',
}: ShimmerProps) => {
  const sxStyles = useSX(sx);
  return (
    <ShimmerContainer
      aria-hidden={ariaHidden}
      aria-busy="true"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuetext={ariaValueText}
      data-testid={testID}
      role="progressbar"
      sx={sxStyles}
      tabIndex={0}
    />
  );
};

const blink = keyframes`
  100% {
    transform: translateX(100%);
  }
`;

const ShimmerContainer = styled.div<{ sx: SXStyles }>`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.compact};
    overflow: hidden;
    position: relative;

    &::after {
      bottom: 0;
      content: '';
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      transform: translateX(-100%);

      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.2) 20%,
        rgba(255, 255, 255, 0.5) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: ${blink} 2s infinite;
    }
  `}
  ${({ sx }) => css`
    ${sx};
  `}
`;

export default Shimmer;
