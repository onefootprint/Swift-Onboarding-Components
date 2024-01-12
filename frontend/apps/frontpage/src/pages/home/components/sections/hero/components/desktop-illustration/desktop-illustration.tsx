import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

import Background from '../background';

const DesktopIllustration = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const mockupControls = useAnimation();
  const containerControls = useAnimation();

  const MOCKUP_WIDTH = 1240;
  const MOCKUP_HEIGHT = 800;

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
      <MockupContainer
        animate={containerControls}
        width={MOCKUP_WIDTH}
        height={MOCKUP_HEIGHT}
      >
        <ImageContainer animate={mockupControls} />
      </MockupContainer>
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

const ImageContainer = styled(motion.div)`
  ${({ theme }) => css`
    position: relative;
    z-index: 2;
    max-width: 100%;
    opacity: 0;
    background-color: ${theme.backgroundColor.primary};
    border-radius: 15px 15px 0 0;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 6px;
      left: 0;
      height: 100%;
      width: 100%;
      background-image: url('/home/hero/hero.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      z-index: 3;
    }

    ${media.greaterThan('md')`
      height: 100%;
      width: 100%;
    `}
  `}
`;

const MockupContainer = styled(motion(Container))<{
  width: number;
  height: number;
}>`
  ${({ theme, width, height }) => css`
    width: ${width}px;
    height: ${height}px;
    position: relative;
    padding: ${theme.spacing[2]};
    padding-bottom: ${theme.spacing[1]}};
    border-radius: ${theme.borderRadius.default};
    isolation: isolate;
    overflow: hidden;
    opacity: 0;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: calc(100% + ${theme.spacing[2]});
      height: calc(100% + ${theme.spacing[2]});
      background: ${theme.backgroundColor.senary};
      z-index: 1;
    }

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
