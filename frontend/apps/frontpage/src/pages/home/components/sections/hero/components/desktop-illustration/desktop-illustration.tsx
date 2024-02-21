import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';

import Background from '../background';

const DesktopIllustration = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const mockupControls = useAnimation();
  const containerControls = useAnimation();

  const mockupVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        delay: 0.8,
      },
    },
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  useEffect(() => {
    if (isInView) {
      mockupControls.start(mockupVariants.visible);
      containerControls.start(containerVariants.visible);
    } else {
      mockupControls.start(mockupVariants.hidden);
      containerControls.start(containerVariants.hidden);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return (
    <IllustrationContainer ref={ref}>
      <StyledBackground />
      <Frame animate={containerControls}>
        <Mockup
          animate={mockupControls}
          src="/home/hero/hero-new.png"
          width={1440}
          height={900}
          alt="hero"
        />
      </Frame>
    </IllustrationContainer>
  );
};

const IllustrationContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    position: relative;
    display: none;

    ${media.greaterThan('lg')`
      display: flex;
      overflow: hidden;
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    `};
  `}
`;

const Mockup = styled(motion(Image))`
  ${({ theme }) => css`
    position: relative;
    z-index: 2;
    max-width: 100%;
    opacity: 0;
    background-color: ${theme.backgroundColor.primary};
    border-radius: 15px 15px 0 0;

    ${media.greaterThan('md')`
      height: 100%;
      width: 100%;
    `}
  `}
`;

const Frame = styled(motion(Container))`
  ${({ theme }) => css`
    position: relative;
    padding: ${theme.spacing[2]};
    padding-bottom: ${theme.spacing[1]}};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.borderColor.tertiary};
    isolation: isolate;
    overflow: hidden;
    opacity: 0;

    ${media.greaterThan('md')`
      bottom: -${theme.spacing[9]};
      border-radius: 22px 22px 0 0;
      padding: ${theme.spacing[3]};
    `}
  `}
`;

const StyledBackground = styled(Background)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export default DesktopIllustration;
