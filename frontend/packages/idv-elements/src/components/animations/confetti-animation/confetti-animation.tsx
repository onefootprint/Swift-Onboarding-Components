import styled, { css } from '@onefootprint/styled';
import React from 'react';
import Confetti from 'react-confetti';

type ConfettiAnimationProps = {
  onComplete: () => void;
  width: number;
  height: number;
  left: number;
  top: number;
};

const colors = ['#76FB8F', '#CBC1F6', '#4A24DB', '#F28900'];

const ConfettiAnimation = ({
  onComplete,
  width,
  height,
  left,
  top,
}: ConfettiAnimationProps) => (
  <Container left={left} top={top}>
    <Confetti
      width={width}
      height={height}
      numberOfPieces={150}
      confettiSource={{ x: 0, y: height * 0.1, w: 0, h: height }}
      onConfettiComplete={onComplete}
      gravity={0.1}
      initialVelocityX={6}
      initialVelocityY={4}
      colors={colors}
      recycle={false}
    />
    <Confetti
      width={width}
      height={height}
      numberOfPieces={150}
      confettiSource={{ x: width, y: height * 0.1, w: 0, h: height }}
      onConfettiComplete={onComplete}
      gravity={0.1}
      initialVelocityX={-6}
      initialVelocityY={4}
      colors={colors}
      recycle={false}
    />
  </Container>
);

const Container = styled.span<{ left: number; top: number }>`
  ${({ theme, left, top }) => css`
    pointer-events: none;
    user-select: none;
    z-index: ${theme.zIndex.toast};
    position: fixed;
    left: ${left}px;
    top: ${top}px;
  `}
`;

export default ConfettiAnimation;
