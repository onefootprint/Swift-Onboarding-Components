import { IcoFootprint40 } from '@onefootprint/icons';
import { motion } from 'framer-motion';
import times from 'lodash/times';
import React from 'react';
import styled, { css, keyframes } from 'styled-components';

type KnobProps = {
  className?: string;
  width: number;
};

const MARKS = 100;

const Knob = ({ className, width }: KnobProps) => (
  <>
    <StyledFootprintIcon color="septenary" />
    <Container className={className}>
      <svg
        width={width}
        height={width}
        viewBox={`0 0 ${width} ${width}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={width / 2}
          cy={width / 2}
          r={width / 2}
          stroke="url(#circle)"
          strokeOpacity="0.2"
        />
        <circle
          cx={width / 2}
          cy={width / 2}
          r={width / 2}
          stroke="url(#gradient)"
        />
        <defs>
          <linearGradient id="gradient" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2fdaf1" />
            <stop offset="10%" stopColor="#2fdaf1" stopOpacity={0} />
            <stop offset="90%" stopColor="#00FF00" stopOpacity={0} />
            <stop offset="100%" stopColor="#00FF00" />
          </linearGradient>
          <linearGradient id="circle" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity={0} />
            <stop offset="50%" stopColor="white" />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
      <Marks>
        <Wrapper>
          {times(MARKS).map(value => (
            <Mark key={value} value={value} />
          ))}
        </Wrapper>
      </Marks>
    </Container>
  </>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    position: absolute;
    transform: translate(-50%, 0%);
    left: 50%;
    border-radius: ${theme.borderRadius.full};
    background: radial-gradient(
      50% 50% at 50% 50%,
      ${theme.backgroundColor.transparent} 0%,
      ${theme.backgroundColor.tertiary} 100%
    );
    backdrop-filter: blur(1px);

    &::after {
      content: '';
      position: absolute;
      width: 1px;
      height: 6px;
      top: -4px;
      background-color: ${theme.backgroundColor.quinary};
      opacity: 0.4;
      left: 49%;
    }
  `}
`;
const rotation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-20deg);
  }
  100% {
    transform: rotate(180deg);
  }
`;

const Marks = styled.span`
  position: absolute;
  width: 100%;
  height: 100%;
  animation-name: ${rotation};
  animation-duration: 8s;
  animation-iteration-count: infinite;
`;

const Wrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
`;

const Mark = styled(motion.div)<{ value: number }>`
  ${({ theme, value }) => css`
    position: absolute;
    width: 3px;
    height: 100%;
    transform: rotate(${value * (360 / MARKS)}deg) translate(-50%, 0%);
    left: 49%;

    &:after {
      content: '';
      position: absolute;
      width: 1px;
      background-color: ${theme.backgroundColor.secondary};
      height: 6px;
      top: 4px;
      left: 1px;
      opacity: 0.5;

      ${value % 10 === 0 &&
      css`
        height: 12px;
      `}
    }
  `}
`;

const StyledFootprintIcon = styled(IcoFootprint40)`
  z-index: 4;
  position: absolute;
  transform: translate(-50%, 0%);
  left: 50%;
`;

export default Knob;
