import { primitives } from '@onefootprint/design-tokens';
import { IcoFootprint40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

type KnobProps = {
  width: number;
  className?: string;
};

const rings = [
  {
    delay: 0,
    diameter: 1.7,
  },
  {
    delay: 2,
    diameter: 1.4,
  },
  {
    delay: 4,
    diameter: 1.2,
  },
  {
    delay: 6,
    diameter: 1,
  },
  {
    delay: 8,
    diameter: 0.7,
  },
];

const Knob = ({ width, className }: KnobProps) => (
  <Container className={className} width={width}>
    {rings.map(({ delay, diameter }) => (
      <Ring
        key={delay}
        diameter={width * diameter}
        initial={{
          width,
          height: width,
          opacity: 0,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          transform: 'translate(-50%, -50%)',
          width: width * 2,
          height: width * 2,
          opacity: [0, 0.8, 0],
        }}
        transition={{
          repeat: Infinity,
          ease: 'easeInOut',
          duration: 10,
          delay,
        }}
      />
    ))}
    <CenterKnob>
      <Center diameter={width * 0.9} />
      <Grid
        src="/home/vault-proxy/knob/grid.svg"
        height={400}
        width={400}
        style={{ opacity: 0.9 }}
        alt="Knob"
        priority
      />
    </CenterKnob>
    <IcoFootprint40 color="quinary" />
  </Container>
);

const Ring = styled(motion.div)<{ diameter?: number }>`
  ${({ diameter }) => css`
    height: ${diameter}px;
    width: ${diameter}px;
    background-color: rgba(255, 255, 255, 0.2);
    background-blend-mode: soft-light;
    box-shadow: 0px 1px 0px 0px rgba(0, 0, 0, 0.2) inset;
    border-radius: 50%;
  `}
`;

const Center = styled.div<{ diameter?: number }>`
  ${({ diameter, theme }) => css`
    height: ${diameter}px;
    width: ${diameter}px;
    border-radius: ${theme.borderRadius.full};
    background: linear-gradient(
        180deg,
        ${primitives.Gray1000} 0%,
        ${primitives.Gray800} 100%
      ),
      ${primitives.Gray1000};
    box-shadow: 0.3px 0.5px 0px 0px rgba(255, 255, 255, 0.1) inset,
      -0.3px -0.5px 0px 0px rgba(255, 255, 255, 0.4) inset,
      1px 1px 4px 0px ${primitives.Gray1000} inset;
  `}
`;

const Container = styled.div<{ width?: number }>`
  ${({ width }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    height: ${width}px;
    width: ${width}px;

    & > * {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  `}
`;

const Grid = styled(Image)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  mask: radial-gradient(
    50% 40% at 50% 50%,
    transparent 0%,
    black 80%,
    transparent 90%
  );
  mask-mode: alpha;
`;

const CenterKnob = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export default Knob;
