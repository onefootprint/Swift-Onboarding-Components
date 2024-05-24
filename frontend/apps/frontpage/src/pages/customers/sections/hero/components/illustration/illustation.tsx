import { Box, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { duration: 0.8, delay: i * 0.1 },
  }),
};

const penguinAppearVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.4, duration: 0.5 },
  },
};

const smokeAppearVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, x: -50, transition: { delay: 0.5, duration: 0.5 } },
};

const Illustration = () => (
  <IllustrationContainer
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    <Cloud
      src="/customers/section/cloud.svg"
      alt="Cloud"
      width={400}
      height={400}
      variants={itemVariants}
      custom={1}
      initial="hidden"
      animate="visible"
    />
    <Sun
      src="/customers/section/sun.svg"
      alt="Sun"
      width={400}
      height={400}
      variants={itemVariants}
      custom={2}
      initial="hidden"
      animate="visible"
    />
    <CloudGroup
      src="/customers/section/cloud-group.svg"
      alt="Cloud2"
      width={400}
      height={400}
      variants={itemVariants}
      custom={3}
      initial="hidden"
      animate="visible"
    />
    <Character>
      <Smoke
        src="/customers/section/smoke.svg"
        alt="Smoke"
        width={400}
        height={400}
        variants={smokeAppearVariants}
        initial="hidden"
        animate="visible"
      />
      <Penguin
        src="/customers/section/penguin.svg"
        alt="Penguin"
        width={400}
        height={400}
        variants={penguinAppearVariants}
        initial="hidden"
        animate="visible"
      />
    </Character>
  </IllustrationContainer>
);

const IllustrationContainer = styled(motion(Box))`
  position: relative;
  height: 320px;
  width: 100%;
  overflow: hidden;
`;

const Penguin = styled(motion(Image))`
  position: absolute;
  height: auto;
  width: 200px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  ${media.greaterThan('md')`
    transform: translateX(0);
    left: 100%;
  `}
`;

const Cloud = styled(motion(Image))`
  position: absolute;
  transform: translateX(-50%);
  top: 0;
  left: 50%;
  height: auto;
  width: 200px;
`;

const Sun = styled(motion(Image))`
  position: absolute;
  width: 56px;
  height: auto;
  top: 0;
  left: 10%;
  transform: translateX(-50%);

  ${media.greaterThan('md')`
    left: 30%;
  `}
`;

const CloudGroup = styled(motion(Image))`
  position: absolute;
  height: auto;
  width: 150px;
  top: 50%;
  left: 40%;
  transform: translate(-50%, -50%);
`;

const Smoke = styled(motion(Image))`
  position: absolute;
  height: auto;
  width: 300px;
  bottom: 0;
  right: 100%;
  display: none;

  ${media.greaterThan('md')`
    display: block;
  `}
`;

const Character = styled(motion(Box))`
  position: absolute;
  height: auto;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 50%;

  ${media.greaterThan('md')`
    max-width: 40%;
  `}
`;

export default Illustration;
