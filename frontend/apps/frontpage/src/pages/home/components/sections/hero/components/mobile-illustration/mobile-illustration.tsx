import { media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Background from '../background';

const MobileIllustration = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home.hero' });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const mockupControls = useAnimation();

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

  useEffect(() => {
    if (isInView) {
      mockupControls.start(mockupVariants.visible);
    } else {
      mockupControls.start(mockupVariants.hidden);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return (
    <IllustrationContainer ref={ref}>
      <StyledBackground />
      <ImageContainer animate={mockupControls}>
        <Image
          src="/home/hero/home-mobile-new.png"
          height={280}
          width={560}
          alt={t('desktop-img-alt')}
        />
      </ImageContainer>
    </IllustrationContainer>
  );
};

const ImageContainer = styled(motion.div)`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    transform: translateX(-50%);
    left: 15%;
    opacity: 0;
    width: 70%;
    height: auto;

    &::before {
      content: '';
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      width: 100%;
      height: 80%;
      border-radius: 40%;
      box-shadow: ${theme.elevation[3]};
    }

    img {
      z-index: 2;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `}
`;

const IllustrationContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 20%;
    z-index: 2;
  }

  ${media.greaterThan('sm')`
      display: none;
    `};
`;

const StyledBackground = styled(Background)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export default MobileIllustration;
