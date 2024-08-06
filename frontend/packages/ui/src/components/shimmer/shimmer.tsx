import styled, { css, keyframes } from 'styled-components';

import type { BoxProps } from '../box';
import Box from '../box';

export type ShimmerProps = BoxProps;

const Shimmer = ({
  'aria-hidden': ariaHidden,
  'aria-valuetext': ariaValueText = 'Loading...',
  ...props
}: ShimmerProps) => (
  <ShimmerContainer
    aria-busy="true"
    aria-hidden={ariaHidden}
    aria-valuemax={100}
    aria-valuemin={0}
    aria-valuetext={ariaValueText}
    role="progressbar"
    tabIndex={0}
    {...props}
  />
);

const blink = keyframes`
  100% {
    transform: translateX(100%);
  }
`;

const ShimmerContainer = styled(Box)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.sm};
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
        rgba(${theme.backgroundColor.primary}, 0) 0,
        rgba(${theme.backgroundColor.primary}, 0.2) 20%,
        rgba(${theme.backgroundColor.primary}, 0.5) 60%,
        rgba(${theme.backgroundColor.primary}, 0)
      );
      animation: ${blink} 2s infinite;
    }
  `}
`;

export default Shimmer;
