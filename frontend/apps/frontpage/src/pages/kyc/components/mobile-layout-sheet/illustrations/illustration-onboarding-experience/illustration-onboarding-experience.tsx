import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';

const IllustrationOnboardingExperience = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

  return (
    <Container ref={ref}>
      <Elevator style={{ y }}>
        <Image src="/kyc/onboarding-experience/top.png" alt="" height={273} width={342.75} />
        <Image src="/kyc/onboarding-experience/center.png" alt="" height={273} width={342.75} />
        <Image src="/kyc/onboarding-experience/bottom.png" alt="" height={273} width={342.75} />
      </Elevator>
    </Container>
  );
};

const Container = styled(motion.div)`
  ${({ theme }) => css`
    max-width: 100%;
    height: 480px;
    mask: linear-gradient(
      180deg,
      transparent 0%,
      black 25%,
      black 75%,
      transparent 100%
    );
    mask-type: alpha;
    background-color: ${theme.backgroundColor.primary};
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  `};
`;

const Elevator = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    width: 100%;

    img {
      width: 95%;
      object-fit: contain;
    }
  `}
`;

export default IllustrationOnboardingExperience;
