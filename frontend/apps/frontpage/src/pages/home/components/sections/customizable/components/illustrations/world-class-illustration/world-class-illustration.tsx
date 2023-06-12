import { media } from '@onefootprint/ui';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect } from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration/base-illustration';
import styled, { css } from 'styled-components';

type WorldClassIllustrationProps = {
  isHover?: boolean;
};

const WorldClassIllustration = ({ isHover }: WorldClassIllustrationProps) => {
  const controlsFirstLayer = useAnimation();
  const controlsSecondLayer = useAnimation();
  const controlsThirdLayer = useAnimation();

  const firstLayerVariants = {
    initial: {
      x: 0,
      y: 0,
    },
    animate: {
      x: '-8px',
      y: '-8px',
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
  };

  const secondLayerVariants = {
    initial: {
      x: '24px',
      y: '24px',
    },
    animate: {
      x: '8px',
      y: '8px',
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
  };

  const thirdLayerVariants = {
    initial: {
      x: '48px',
      y: '48px',
      zIndex: 0,
    },
    animate: {
      x: '24px',
      y: '24px',
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
  };

  useEffect(() => {
    if (isHover) {
      controlsFirstLayer.start(firstLayerVariants.animate);
      controlsSecondLayer.start(secondLayerVariants.animate);
      controlsThirdLayer.start(thirdLayerVariants.animate);
    } else {
      controlsFirstLayer.start(firstLayerVariants.initial);
      controlsSecondLayer.start(secondLayerVariants.initial);
      controlsThirdLayer.start(thirdLayerVariants.initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHover]);

  return (
    <StyledBaseIllustration>
      <Wrapper isHover={isHover}>
        <FirstLayer animate={controlsFirstLayer}>
          <Image
            src="/home/customizable/world-class/layer-1.png"
            alt="developer experience"
            height={608}
            width={360}
          />
        </FirstLayer>
        <Layer animate={controlsSecondLayer} />
        <Layer animate={controlsThirdLayer} />
      </Wrapper>
    </StyledBaseIllustration>
  );
};

const Wrapper = styled.div<{ isHover?: boolean }>`
  ${({ theme, isHover }) => css`
    position: absolute;
    isolation: isolate;
    left: 0;
    top: 32px;
    z-index: 2;
    left: 10%;

    & > * {
      transition: box-shadow 0.3s ease-in-out;
      box-shadow: ${isHover ? theme.elevation[2] : 'none'};
    }

    ${media.greaterThan('lg')`
      left: 20%;
      top: 20%;
    `}
  `}
`;

const FirstLayer = styled(motion.span)`
  display: flex;
  position: absolute;
  z-index: 3;
  overflow: hidden;
  width: 360px;
  height: 608px;
  will-change: transform translate box-shadow;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Layer = styled(motion.span)`
  ${({ theme }) => css`
    display: flex;
    position: absolute;
    z-index: 2;
    width: 360px;
    height: 608px;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    background: linear-gradient(180deg, #ffffff95 0, #fafafa90 50%);
    will-change: transform translate box-shadow;
  `}
`;

const StyledBaseIllustration = styled(BaseIllustration)`
  &::after {
    content: '';
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    background: linear-gradient(
      180deg,
      rgba(247, 247, 247, 0.5) 37.81%,
      rgba(246, 246, 246, 0) 106.99%
    );
    width: 100%;
    height: 100%;
  }
`;

export default WorldClassIllustration;
