import { motion, useAnimationControls } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect } from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration/base-illustration';
import styled from 'styled-components';

type CustomizableIllustrationProps = {
  isHover?: boolean;
};

const CustomizableIllustration = ({
  isHover,
}: CustomizableIllustrationProps) => {
  const controlsRight = useAnimationControls();
  const controlsLeft = useAnimationControls();
  const controlsCenter = useAnimationControls();

  const leftImageVariants = {
    hover: {
      x: '-10%',
      y: '0',
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    initial: {
      x: '-20%',
      y: '50%',
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
  };

  const rightImageVariants = {
    hover: {
      x: '10%',
      y: '0',
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    initial: {
      x: '20%',
      y: '-50%',
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
  };

  const centerImageVariants = {
    hover: {
      boxShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    initial: {
      zIndex: 2,
      boxShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
  };

  useEffect(() => {
    if (isHover) {
      controlsRight.start(leftImageVariants.hover);
      controlsLeft.start(rightImageVariants.hover);
      controlsCenter.start(centerImageVariants.hover);
    } else {
      controlsRight.start(leftImageVariants.initial);
      controlsLeft.start(rightImageVariants.initial);
      controlsCenter.start(centerImageVariants.initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHover]);

  return (
    <StyledBaseIllustration>
      <motion.span animate={controlsRight}>
        <Image
          src="/home/customizable/make-it-own/modal-green.png"
          alt="decorative"
          height={213}
          width={266}
        />
      </motion.span>
      <motion.span animate={controlsCenter}>
        <Image
          src="/home/customizable/make-it-own/modal-main.png"
          alt="decorative"
          height={213}
          width={266}
        />
      </motion.span>
      <motion.span animate={controlsLeft}>
        <Image
          src="/home/customizable/make-it-own/modal-purple.png"
          alt="decorative"
          height={213}
          width={266}
        />
      </motion.span>
    </StyledBaseIllustration>
  );
};

const StyledBaseIllustration = styled(BaseIllustration)`
  isolation: isolate;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  span {
    will-change: transform translate box-shadow;
  }

  &::before {
    content: '';
    position: absolute;
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

export default CustomizableIllustration;
