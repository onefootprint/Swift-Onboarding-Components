import { media } from '@onefootprint/ui';
import Lottie from 'lottie-react';
import React from 'react';
import styled, { css } from 'styled-components';

import LottieFile from './confetti-lottie.json';

const ConfettiAnimation = () => (
  <>
    <Overlay />
    <AnimationContainer animationData={LottieFile} loop={false} />
  </>
);
const AnimationContainer = styled(Lottie)`
  position: absolute;
  top: -30vh;
  left: 0;
  height: 100vh;
  width: 92vw;
  pointer-events: none;
  isolation: isolate;
  z-index: 1;

  ${media.greaterThan('sm')`
    height: 200%;
    width: 200%;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
  `}
`;

const Overlay = styled.span`
  ${({ theme }) => css`
    display: block;
    position: fixed;
    bottom: 40px;
    left: 0;
    height: 50%;
    width: 100%;
    z-index: 2;
    background: linear-gradient(
      180deg,
      ${theme.backgroundColor.transparent} 0%,
      ${theme.backgroundColor.primary} 20%,
      ${theme.backgroundColor.primary} 100%
    );

    ${media.greaterThan('sm')`
      display: none;
    `};
  `}
`;

export default ConfettiAnimation;
