import { media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';

import BaseIllustration from '../../../../components/base-illustration';

const topRight = {
  initial: {
    x: 300,
    y: -100,
    opacity: 0,
    zIndex: 0,
    scale: 2,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: -200,
    x: 400,
    filter: 'blur(2px)',
    transition: {
      duration: 1,
      delay: 1,
    },
  },
};

const topLeft = {
  initial: {
    x: -300,
    y: -100,
    opacity: 0,
    zIndex: 0,
    scale: 2,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: -200,
    x: -400,
    filter: 'blur(2px)',
    transition: {
      duration: 0.8,
      delay: 1,
    },
  },
};

const bottomLeft = {
  initial: {
    x: -300,
    y: 100,
    opacity: 0,
    zIndex: 0,
    scale: 2,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 200,
    x: -400,
    filter: 'blur(2px)',
    transition: {
      duration: 1,
      delay: 1,
    },
  },
};

const bottomRight = {
  initial: {
    x: 300,
    y: 100,
    opacity: 0,
    zIndex: 0,
    scale: 2,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 200,
    x: 400,
    filter: 'blur(2px)',
    transition: {
      duration: 1,
      delay: 1,
    },
  },
};

const center = {
  initial: {
    opacity: 0,
    scale: 1.2,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      delay: 0.8,
    },
  },
};

const DesktopIllustration = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <IllustrationWrapper ref={ref}>
      <ElementWrapper
        as={motion.div}
        data-position="center"
        initial="initial"
        variants={center}
        animate={controls}
      >
        <Image
          src="/new-home/customizable/1.png"
          height={398}
          width={500}
          alt="slider"
        />
      </ElementWrapper>
      <ElementWrapper
        as={motion.div}
        variants={topRight}
        initial="initial"
        id="top-right"
        animate={controls}
      >
        <Image
          src="/new-home/customizable/2.png"
          height={318}
          width={380}
          alt="slider"
        />
      </ElementWrapper>
      <ElementWrapper
        as={motion.div}
        variants={topLeft}
        initial="initial"
        data-position="top-left"
        animate={controls}
      >
        <Image
          src="/new-home/customizable/3.png"
          height={318}
          width={380}
          alt="slider"
        />
      </ElementWrapper>
      <ElementWrapper
        as={motion.div}
        variants={bottomLeft}
        initial="initial"
        data-position="bottom-left"
        animate={controls}
      >
        <Image
          src="/new-home/customizable/4.png"
          height={318}
          width={380}
          alt="slider"
        />
      </ElementWrapper>
      <ElementWrapper
        as={motion.div}
        variants={bottomRight}
        initial="initial"
        data-position="bottom-right"
        animate={controls}
      >
        <Image
          src="/new-home/customizable/5.png"
          height={318}
          width={380}
          alt="slider"
        />
      </ElementWrapper>
    </IllustrationWrapper>
  );
};

const IllustrationWrapper = styled(BaseIllustration)`
  position: relative;
  display: none;
  background: radial-gradient(at 0% 0%, #fff6f3 16%, rgba(246, 209, 193, 0) 50%),
    radial-gradient(at 0% 100%, #f2f9ff 0%, rgba(200, 228, 255, 0) 100%),
    radial-gradient(at 100% 50%, #fefff0 0%, white 100%), white;

  ${media.greaterThan('md')`
    display: block;
    display: flex; 
    align-items: center; 
    justify-content: center;
    `}
`;

const ElementWrapper = styled.div`
  ${({ theme }) => css`
    position: relative;

    &[data-position='center'] {
      position: absolute;
      z-index: 1;
    }

    &[data-position='top-right'],
    &[data-position='top-left'],
    &[data-position='bottom-left'],
    &[data-position='bottom-right'] {
      position: absolute;
      box-shadow: ${theme.elevation[2]};
    }
  `}
`;

export default DesktopIllustration;
