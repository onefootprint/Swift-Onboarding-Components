import { media } from '@onefootprint/ui';
import { motion, useAnimationControls } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect } from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration';
import styled, { css } from 'styled-components';

type EasyFlexibleIllustrationProps = {
  isHover?: boolean;
};

const EasyFlexibleIllustration = ({
  isHover,
}: EasyFlexibleIllustrationProps) => {
  const gridAnimationControls = useAnimationControls();
  const imageAnimationControls = useAnimationControls();

  useEffect(() => {
    if (isHover) {
      gridAnimationControls.start(electicVariants.visible);
      imageAnimationControls.start(centerImageVariants.raised);
    } else {
      gridAnimationControls.start(electicVariants.initial);
      imageAnimationControls.start(centerImageVariants.initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHover]);

  const electicVariants = {
    initial: {
      opacity: 0,
      pathLength: 0,
    },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: {
        duration: 1,
        ease: 'easeOut',
      },
    },
    transition: {
      duration: 5,
      ease: 'easeOut',
      repeat: Infinity,
      repeatType: 'reverse',
    },
  };

  const centerImageVariants = {
    initial: {
      boxShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',
    },
    raised: {
      boxShadow: '0px 1px 12px 0px rgba(0, 0, 0, 0.12)',
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <StyledBaseIllustration>
      <CenterImage
        variants={centerImageVariants}
        initial="initial"
        animate={imageAnimationControls}
      >
        <Image
          src="/home/customizable/easy-flexible/code-snippet.png"
          alt="decorative"
          height={1377}
          width={1620}
        />
      </CenterImage>
      <BackgroundGrid>
        <motion.svg
          width="620"
          height="350"
          viewBox="0 0 620 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M620 24.5L0 24.5001M620 48.5L0 48.5001M620 72.5L0 72.5001M620 96.5L0 96.5001M620 120.5L0 120.5M620 144.5L0 144.5M620 168.5L0 168.5M620 192.5L0 192.5M620 216.5L0 216.5M620 240.5L0 240.5M620 264.5L0 264.5M620 288.5L0 288.5M620 312.5L0 312.5M620 336.5L0 336.5M24.5 0L24.5 350M48.5 0L48.5 350M72.5 0L72.5 350M96.5 0L96.5 350M120.5 0L120.5 350M144.5 0L144.5 350M168.5 0L168.5 350M192.5 0L192.5 350M216.5 0L216.5 350M240.5 0L240.5 350M264.5 0L264.5 350M288.5 0V350M312.5 0V350M336.5 0V350M360.5 0V350M384.5 0V350M408.5 0V350M432.5 0V350M456.5 0V350M480.5 0V350M504.5 0V350M528.5 0V350M552.5 0L552.5 350M576.5 0L576.5 350M600.5 0L600.5 350"
            stroke="#d1d1d1"
          />
          <motion.path
            d="M620 24.5L0 24.5001M620 48.5L0 48.5001M620 72.5L0 72.5001M620 96.5L0 96.5001M620 120.5L0 120.5M620 144.5L0 144.5M620 168.5L0 168.5M620 192.5L0 192.5M620 216.5L0 216.5M620 240.5L0 240.5M620 264.5L0 264.5M620 288.5L0 288.5M620 312.5L0 312.5M620 336.5L0 336.5M24.5 0L24.5 350M48.5 0L48.5 350M72.5 0L72.5 350M96.5 0L96.5 350M120.5 0L120.5 350M144.5 0L144.5 350M168.5 0L168.5 350M192.5 0L192.5 350M216.5 0L216.5 350M240.5 0L240.5 350M264.5 0L264.5 350M288.5 0V350M312.5 0V350M336.5 0V350M360.5 0V350M384.5 0V350M408.5 0V350M432.5 0V350M456.5 0V350M480.5 0V350M504.5 0V350M528.5 0V350M552.5 0L552.5 350M576.5 0L576.5 350M600.5 0L600.5 350"
            stroke="url(#gradient)"
            animate={gridAnimationControls}
          />
          <defs>
            <radialGradient id="gradient" gradientUnits="userSpaceOnUse">
              <stop offset=".5" stopColor="#3e82ff" />
              <stop offset="1" stopColor="#4eee63" />
            </radialGradient>
          </defs>
        </motion.svg>
      </BackgroundGrid>
    </StyledBaseIllustration>
  );
};

const BackgroundGrid = styled.span`
  opacity: 0.5;
`;

const CenterImage = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 2;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    transition: box-shadow 0.3s ease-in;
    height: 380px;
    width: 440px;

    ${media.greaterThan('lg')`
      transform: translate(-50%, 0%);
      height: 459px;
      width: 540px;
      top: 40px;
      left: 50%;
    `}

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  `}
`;

const StyledBaseIllustration = styled(BaseIllustration)`
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(
      180deg,
      rgba(74, 36, 219, 0.01) 0%,
      rgba(74, 36, 219, 0) 100%
    );
    width: 100%;
    height: 100%;
    isolation: isolate;
  }
`;

export default EasyFlexibleIllustration;
