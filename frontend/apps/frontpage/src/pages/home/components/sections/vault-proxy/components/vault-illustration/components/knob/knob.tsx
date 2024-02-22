import { IcoFootprint40 } from '@onefootprint/icons';
import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

type KnobProps = {
  width: number;
  className?: string;
};

const rings = [
  {
    key: 5,
    diameter: 1.7,
  },
  {
    key: 4,
    diameter: 2.2,
  },
  {
    key: 3,
    diameter: 1.8,
  },
  {
    key: 2,
    diameter: 1.4,
  },
  {
    key: 1,
    diameter: 0.7,
  },
];

const Knob = ({ width, className }: KnobProps) => (
  <Container className={className} width={width}>
    {rings.map(({ key, diameter }) => (
      <Ring key={key} diameter={width * diameter} data-order={key} />
    ))}
    <CenterKnob>
      <Center diameter={width * 0.9} />
    </CenterKnob>
    <IcoFootprint40 color="quinary" />
  </Container>
);

const Ring = styled(motion.div)<{ diameter: number }>`
  ${({ diameter }) => css`
    height: ${diameter / 1.4}px;
    width: ${diameter / 1.4}px;
    background-blend-mode: soft-light;
    border-radius: 100%;

    ${media.greaterThan('sm')`
      height: ${diameter}px;
      width: ${diameter}px;
    `}

    &[data-order='2'] {
      background-color: rgba(0, 0, 0, 0.2);
      fill: radial-gradient(
        147.73% 147.73% at 50% 50%,
        rgba(26, 30, 40, 0.8) 0%,
        transparent 100%
      );
      box-shadow:
        0px 1px 0px 0px rgba(255, 255, 255, 0.2) inset,
        0px 1px 0px 1px rgba(0, 0, 0, 0.1);
      filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5)), blur(1px);
    }

    &[data-order='3'] {
      background-color: rgba(0, 0, 0, 0.2);
      fill: radial-gradient(
        147.73% 147.73% at 50% 50%,
        rgba(26, 30, 40, 0.8) 0%,
        transparent 100%
      );
      box-shadow:
        0px 1px 0px 0px rgba(255, 255, 255, 0.2) inset,
        0px 1px 0px 1px rgba(0, 0, 0, 0.1);
      filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5)), blur(1px);
    }

    &[data-order='4'] {
      background-color: rgba(0, 0, 0, 0.2);
      fill: radial-gradient(
        147.73% 147.73% at 50% 50%,
        rgba(26, 30, 40, 0.8) 0%,
        transparent 100%
      );
      box-shadow:
        0px 1px 0px 0px rgba(255, 255, 255, 0.2) inset,
        0px 1px 0px 1px rgba(0, 0, 0, 0.2);
      filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5)), blur(1px);
    }
  `}
`;

const Center = styled.div<{ diameter: number }>`
  ${({ diameter, theme }) => css`
    height: ${diameter / 1.4}px;
    width: ${diameter / 1.4}px;
    border-radius: ${theme.borderRadius.full};
    background: linear-gradient(
        180deg,
        rgba(0, 0, 50, 0.2) 0%,
        rgba(0, 0, 0, 0.5) 100%
      ),
      rgba(0, 0, 0, 0.5);
    box-shadow:
      0.3px 0.5px 0px 0px rgba(255, 255, 255, 0.1) inset,
      -0px -0.5px 0px 0px rgba(255, 255, 255, 0.1) inset,
      1px 1px 4px 0px rgba(0, 0, 0, 0.5) inset;

    ${media.greaterThan('sm')`
  height: ${diameter}px;
    width: ${diameter}px;
  `}
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

const CenterKnob = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export default Knob;
