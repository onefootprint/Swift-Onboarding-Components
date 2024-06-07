import type { MotionValue } from 'framer-motion';
import { motion, useTransform } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

type IllustrationOnboardingExperienceProps = {
  scroll: MotionValue;
};

const VISIBLE_RANGE = {
  initial: 0.45,
  initialMax: 0.6,
  finalMax: 0.75,
  final: 0.8,
};

const IllustrationOnboardingExperience = ({ scroll }: IllustrationOnboardingExperienceProps) => {
  const y = useTransform(scroll, [VISIBLE_RANGE.initialMax, VISIBLE_RANGE.finalMax], ['-25%', '25%']);
  const opacity = useTransform(
    scroll,
    [VISIBLE_RANGE.initial, VISIBLE_RANGE.initialMax, VISIBLE_RANGE.finalMax, VISIBLE_RANGE.final],
    ['0%', '100%', '100%', '0%'],
  );

  return (
    <Container style={{ opacity }}>
      <Elevator style={{ y }}>
        <Image src="/kyc/onboarding-experience/top.png" alt="" height={365} width={457} />
        <Image src="/kyc/onboarding-experience/center.png" alt="" height={365} width={457} />
        <Image src="/kyc/onboarding-experience/bottom.png" alt="" height={365} width={457} />
      </Elevator>
    </Container>
  );
};

const Container = styled(motion.div)`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    max-height: 650px;
    mask: linear-gradient(
      180deg,
      transparent 0%,
      black 25%,
      black 75%,
      transparent 100%
    );
    mask-type: alpha;
    background-color: ${theme.backgroundColor.primary};
    position: relative;
    overflow: hidden;
    transform: translateY(-50%);
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    user-select: none;
    touch-action: none;
  `};
`;

const Elevator = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    width: fit-content;
  `}
`;

export default IllustrationOnboardingExperience;
