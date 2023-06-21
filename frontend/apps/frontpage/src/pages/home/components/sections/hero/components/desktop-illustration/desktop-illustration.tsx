import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';

import Background from '../background';

const DesktopIllustration = () => {
  const { t } = useTranslation('pages.home.hero');
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
        <ImageContainer animate={mockupControls}>
          <Image
            src="/home/hero/hero.png"
            height={682}
            width={1024}
            alt={t('desktop-img-alt')}
          />
        </ImageContainer>
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

      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 20%;
        z-index: 2;
        background: linear-gradient(
          180deg,
          transparent 0%,
          rgba(250, 250, 250, 0.6) 100%
        );
      }
    `};
  `}
`;

const ImageContainer = styled(motion.div)`
  z-index: 2;
  max-width: 100%;
  opacity: 0;

  img {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  ${media.greaterThan('md')`
    height: 682px;
    width: 1024px;
  `}
`;

const MockupContainer = styled(motion(Container))`
  ${({ theme }) => css`
    && {
      max-width: 1024px;
    }
    position: relative;
    padding: ${theme.spacing[2]};
    padding-bottom: ${theme.spacing[1]}};
    background-color: ${theme.backgroundColor.senary};
    height: fit-content;
    bottom: 16px;
    border-radius: 6px;
    isolation: isolate;
    overflow: hidden;
    opacity: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    }

    ${media.greaterThan('md')`
      bottom: -20px;
      border-radius: 22px 22px 0 0;
      padding: ${theme.spacing[3]};

      img {
        border-radius: ${theme.borderRadius.large} ${theme.borderRadius.large} 0 0;
      }
    `};
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
