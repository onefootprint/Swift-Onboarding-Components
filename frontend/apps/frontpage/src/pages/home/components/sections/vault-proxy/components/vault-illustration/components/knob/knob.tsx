import { IcoFootprint40 } from '@onefootprint/icons';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

type KnobProps = {
  width: number;
  className?: string;
};

const Knob = ({ width, className }: KnobProps) => (
  <Container className={className} width={width}>
    <Ring
      diameter={width * 1.7}
      opacity={0.5}
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
        opacity: [0, 1, 0],
      }}
      transition={{
        repeat: Infinity,
        ease: 'easeInOut',
        duration: 6,
      }}
    />
    <Ring
      diameter={width * 1.45}
      opacity={0.7}
      initial={{
        width: width * 1.5,
        height: width * 1.5,
        opacity: 0,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        transform: 'translate(-50%, -50%)',
        width: width * 2.4,
        height: width * 2.4,
        opacity: [0, 1, 0],
      }}
      transition={{
        repeat: Infinity,
        ease: 'easeInOut',
        duration: 8,
        delay: 1,
      }}
    />
    <Ring
      diameter={width * 1.2}
      opacity={1}
      initial={{
        width: width * 1.2,
        height: width * 1.2,
        opacity: 0.8,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        transform: 'translate(-50%, -50%)',
        width: width * 1.4,
        height: width * 1.4,
        opacity: 1,
      }}
      transition={{
        repeat: Infinity,
        ease: 'easeInOut',
        repeatType: 'reverse',
        duration: 8,
        delay: 1,
      }}
    />
    <CenterKnob>
      <Grid
        src="/home/vault-proxy/knob/grid.svg"
        height={400}
        width={400}
        style={{ opacity: 0.9 }}
        alt="Knob"
        priority
      />
      <Center diameter={width * 0.9} />
    </CenterKnob>
    <IcoFootprint40 color="quinary" />
  </Container>
);

const Ring = styled(motion.div)<{ diameter?: number; opacity?: number }>`
  ${({ diameter, theme, opacity }) => css`
    height: ${diameter}px;
    width: ${diameter}px;
    background: radial-gradient(
      150% 150% at 50% 50%,
      rgba(48, 69, 122, 0.8) 0%,
      rgba(30, 52, 107, 0) 100%
    );
    box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.2);
    filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5));
    border-radius: ${theme.borderRadius.full};
    opacity: ${opacity};
  `}
`;

const Center = styled.div<{ diameter?: number }>`
  ${({ diameter, theme }) => css`
    height: ${diameter}px;
    width: ${diameter}px;
    border-radius: ${theme.borderRadius.full};
    background: linear-gradient(180deg, #0b0e2e 0%, rgba(18, 21, 48, 0) 200%);
    box-shadow: inset 1px 1px 4px #000000,
      inset -0.3px -0.5px 0px rgba(255, 255, 255, 0.4),
      inset 0.3px 0.5px 0px rgba(255, 255, 255, 0.1);
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
  mask: radial-gradient(50% 40% at 50% 50%, white 0%, transparent 100%);
  mask-mode: alpha;
`;

const CenterKnob = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export default Knob;
