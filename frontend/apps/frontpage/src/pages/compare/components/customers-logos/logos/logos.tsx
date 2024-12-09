import { Box, media } from '@onefootprint/ui';
import { motion, useAnimation } from 'framer-motion';
import uniqueId from 'lodash/uniqueId';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import {
  ApitureLogo,
  Aryeo,
  BloomLogo,
  ComposerLogo,
  FindigsLogo,
  FlexcarLogo,
  Goodfin,
  GridLogo,
  WingSpan,
  YieldStreet,
} from 'src/components/company-logos/themed';

const logos = [
  ComposerLogo,
  GridLogo,
  FlexcarLogo,
  FindigsLogo,
  ApitureLogo,
  BloomLogo,
  YieldStreet,
  WingSpan,
  Goodfin,
  Aryeo,
];

const GROUP_SIZE = 4;
const ANIMATION_SPEED = 4000;

const marqueeContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: 'loop' as const,
    },
  },
};

const marqueeItemVariants = {
  initial: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.2,
      ease: 'linear',
    },
  },
};

const Logos = () => {
  const [currentLogos, setCurrentLogos] = useState(logos.slice(0, GROUP_SIZE));
  const [index, setIndex] = useState(0);
  const controls = useAnimation();

  const getNextLogoGroup = () => {
    const nextIndex = (index + GROUP_SIZE) % logos.length;
    const nextLogos = [];
    for (let i = 0; i < GROUP_SIZE; i++) {
      nextLogos.push(logos[(nextIndex + i) % logos.length]);
    }
    setCurrentLogos(nextLogos);
    setIndex(nextIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getNextLogoGroup();
    }, ANIMATION_SPEED);
    return () => clearInterval(interval);
  }, [index]);

  useEffect(() => {
    controls.start('animate');
  }, [currentLogos, controls]);

  return (
    <MarqueeContainer variants={marqueeContainerVariants} initial="initial" animate={controls}>
      {currentLogos.map(logo => {
        const RenderedLogo = logo;
        return (
          <MarqueeItem variants={marqueeItemVariants} key={uniqueId()}>
            <RenderedLogo className="text-tertiary" />
          </MarqueeItem>
        );
      })}
    </MarqueeContainer>
  );
};

const MarqueeContainer = styled(motion(Box))`
  ${({ theme }) => css`
    display: grid;
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-gap: ${theme.spacing[4]};
    padding: ${theme.spacing[2]};
    height: 120px;

    ${media.greaterThan('md')`
      width: auto;
      grid-template-columns: repeat(${GROUP_SIZE}, minmax(140px, 1fr));    
      grid-template-rows: 1fr;
      height: 80px;
      grid-gap: ${theme.spacing[2]};
      padding: ${theme.spacing[2]};
    `}
  `}
`;

const MarqueeItem = styled(motion(Box))`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;

export default Logos;
