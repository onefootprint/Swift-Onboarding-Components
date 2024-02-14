import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Background from '../background';

const TabletIllustration = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home.hero' });
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
      <MockupContainer animate={containerControls}>
        <StyledImage
          src="/home/hero/hero-new.png"
          height={682}
          width={1024}
          alt={t('desktop-img-alt')}
        />
      </MockupContainer>
    </IllustrationContainer>
  );
};

const IllustrationContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    position: relative;
    display: none;
    padding: ${theme.spacing[10]} 0;

    ${media.greaterThan('sm')`
    display: flex;
  `};

    ${media.greaterThan('lg')`
    display: none;
  `};
  `}
`;

const MockupContainer = styled(motion(Container))``;

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[3]};
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

export default TabletIllustration;
