import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 50,
    },
  },
};

const birdVariants = {
  hidden: { y: 20 },
  visible: {
    y: [-85, -79, -85],
    transition: {
      type: 'spring',
      stiffness: 50,
      repeat: Infinity,
      duration: 2,
    },
  },
};

const screenVariants = {
  hidden: {
    opacity: 0,
    filter: 'blur(5px)',
    transform: 'translateY(10px) scale(1.1)',
  },
  visible: {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 50,
    },
  },
};

const Screen = () => (
  <Container initial="hidden" animate="visible" variants={containerVariants}>
    <DesktopMockup
      variants={screenVariants}
      initial="hidden"
      animate="visible"
      src="/home/hero/manual-review.png"
      alt="ID Capture Desktop"
      width={1000}
      height={625}
      priority
    />
    <TabletMockup
      variants={screenVariants}
      initial="hidden"
      animate="visible"
      src="/home/hero/playbook-ipad.png"
      alt="ID Capture Tablet"
      width={720}
      height={496}
      priority
    />
    <MobileMockup
      variants={screenVariants}
      initial="hidden"
      animate="visible"
      src="/home/hero/id-capture-phone.png"
      alt="ID Capture Mobile"
      width={240}
      height={475}
      priority
    />
    <Wire03
      variants={itemVariants}
      src="/home/hero/wire-03.svg"
      alt="Wire 03"
      width={140}
      height={140}
      loading="lazy"
    />
    <Device02
      variants={itemVariants}
      src="/home/hero/device-02.svg"
      alt="Device 02"
      width={140}
      height={140}
      loading="lazy"
    />
    <Wire02
      variants={itemVariants}
      src="/home/hero/wire-02.svg"
      alt="Wire 02"
      width={193}
      height={105}
      loading="lazy"
    />
    <Device03
      variants={itemVariants}
      src="/home/hero/device-03.svg"
      alt="Device 03"
      width={140}
      height={140}
      loading="lazy"
    />
    <Wire05
      variants={itemVariants}
      src="/home/hero/wire-05.svg"
      alt="Wire 05"
      width={70}
      height={200}
      loading="lazy"
    />
    <Device04
      variants={itemVariants}
      src="/home/hero/device-04.svg"
      alt="Device 04"
      width={190}
      height={160}
      loading="lazy"
    />
    <Wire04
      variants={itemVariants}
      src="/home/hero/wire-04.svg"
      alt="Wire 04"
      width={123}
      height={113}
      loading="lazy"
    />
    <Device05
      variants={itemVariants}
      src="/home/hero/device-05.svg"
      alt="Device 05"
      width={70}
      height={170}
      loading="lazy"
    />
    <Wire06
      variants={itemVariants}
      src="/home/hero/wire-06.svg"
      alt="Wire 06"
      width={16}
      height={145}
      loading="lazy"
    />
    <Device06
      variants={itemVariants}
      src="/home/hero/device-06.svg"
      alt="Device 06"
      width={120}
      height={120}
      loading="lazy"
    />
    <Wire07
      variants={itemVariants}
      src="/home/hero/wire-07.svg"
      alt="Wire 07"
      width={123}
      height={160}
    />
    <Device09
      variants={itemVariants}
      src="/home/hero/device-09.svg"
      alt="Device 09"
      width={150}
      height={170}
      loading="lazy"
    />
    <Wire11
      variants={itemVariants}
      src="/home/hero/wire-11.svg"
      alt="Wire 11"
      width={36}
      height={195}
      loading="lazy"
    />
    <Device10
      variants={itemVariants}
      src="/home/hero/device-10.svg"
      alt="Device 10"
      width={72}
      height={190}
      loading="lazy"
    />
    <Device08
      variants={itemVariants}
      src="/home/hero/device-08.svg"
      alt="Device 08"
      width={120}
      height={92}
      loading="lazy"
    />
    <Device07
      variants={itemVariants}
      src="/home/hero/device-07.svg"
      alt="Device 07"
      width={62}
      height={130}
      loading="lazy"
    />
    <motion.div variants={itemVariants}>
      <Bird
        variants={birdVariants}
        src="/home/hero/bird.svg"
        alt="Bird Icon"
        width={80}
        height={75}
        loading="lazy"
      />
    </motion.div>
    <Wire08
      variants={itemVariants}
      src="/home/hero/wire-08.svg"
      alt="Wire 08"
      width={97}
      height={62}
    />
    <Wire10
      variants={itemVariants}
      src="/home/hero/wire-10.svg"
      alt="Wire 10"
      width={81}
      height={94}
      loading="lazy"
    />
    <Penguin
      variants={itemVariants}
      src="/home/hero/penguin.svg"
      alt="Penguin"
      width={155}
      height={300}
      loading="lazy"
    />
    <Sparkles05
      variants={itemVariants}
      src="/home/hero/sparkles-05.svg"
      alt="Sparkles 05"
      width={40}
      height={102}
      loading="lazy"
    />
    <Sparkles04
      variants={itemVariants}
      src="/home/hero/sparkles-04.svg"
      alt="Sparkles 04"
      width={33}
      height={58}
      loading="lazy"
    />
  </Container>
);

const DesktopMockup = styled(motion(Image))`
  ${({ theme }) => css`
    display: none;
    border-radius: ${theme.borderRadius.lg};
    aspect-ratio: 16/10;
    width: 1000px;
    height: auto;
    z-index: 3;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    overflow: hidden;
    box-shadow: ${theme.elevation[1]};

    ${media.greaterThan('md')`
      display: block;
    `}
  `}
`;

const TabletMockup = styled(motion(Image))`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.lg};
    aspect-ratio: 33/23;
    height: auto;
    width: 720px;
    z-index: 3;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    box-shadow: ${theme.elevation[1]};
    overflow: hidden;
    display: none;

    ${media.greaterThan('sm')`
      display: block;
    `}

    ${media.greaterThan('md')`
      display: none;
    `}
  `}
`;

const MobileMockup = styled(motion(Image))`
  border-radius: 40px;
  aspect-ratio: 1/2;
  height: auto;
  width: 260px;
  z-index: 3;
  overflow: hidden;
  display: block;

  ${media.greaterThan('sm')`
    display: none;
  `}
`;

const Container = styled(motion.div)`
  position: relative;
`;

const Wire03 = styled(motion(Image))`
  position: absolute;
  top: 8px;
  transform: translateY(-100%) scale(0.9);
  right: calc(100% - 90px);
`;

const Device02 = styled(motion(Image))`
  position: absolute;
  top: -57px;
  transform: translateY(-100%) scale(0.9);
  right: calc(100% + 33.25px);
  z-index: 1;
`;

const Wire02 = styled(motion(Image))`
  position: absolute;
  transform: translateY(-100%) scale(0.9);
  top: 9.5px;
  z-index: 0;
  right: calc(100% + 61.75px);
`;

const Device03 = styled(motion(Image))`
  position: absolute;
  top: -30px;
  right: calc(100% + 165px);
  transform: scale(0.9);
  z-index: 1;
`;

const Wire05 = styled(motion(Image))`
  position: absolute;
  top: 85px;
  right: calc(100% + 194.75px);
  transform: scale(0.9);
  z-index: 0;
`;

const Device04 = styled(motion(Image))`
  position: absolute;
  top: 265px;
  right: calc(100% + 133px);
  transform: scale(0.9);
  z-index: 1;
`;

const Wire04 = styled(motion(Image))`
  position: absolute;
  top: 30px;
  transform: translateX(100%) scale(0.9);
  right: calc(100% + 185px);
  z-index: 0;
`;

const Device05 = styled(motion(Image))`
  position: absolute;
  top: 120px;
  right: calc(100% + 38px);
  transform: scale(0.9);
  z-index: 1;
`;

const Wire06 = styled(motion(Image))`
  position: absolute;
  top: 260px;
  right: calc(100% + 65px);
  transform: scale(0.9);
  z-index: 0;
`;

const Device06 = styled(motion(Image))`
  position: absolute;
  top: 380px;
  right: calc(100% + 13px);
  transform: scale(0.9);
  z-index: 1;
`;

const Wire07 = styled(motion(Image))`
  position: absolute;
  top: 0px;
  left: calc(100% - 65px);
  transform: translateY(-30%) scaleX(1.2) scaleY(0.9);
  z-index: 0;

  ${media.greaterThan('sm')`
    left: calc(100% - 46px);
    transform: translateY(-30%) scaleX(0.9) scaleY(0.9);
  `}
`;

const Device09 = styled(motion(Image))`
  position: absolute;
  top: 90px;
  left: calc(100% + 35px);
  transform: scale(0.9);
  z-index: 1;
`;

const Wire11 = styled(motion(Image))`
  position: absolute;
  top: 190px;
  left: calc(100% + 28.5px);
  transform: scale(0.9);
  z-index: 1;
`;

const Device10 = styled(motion(Image))`
  position: absolute;
  top: 337.25px;
  left: calc(100% + 47px);
  transform: scale(0.9);
  z-index: 1;
`;

const Wire10 = styled(motion(Image))`
  position: absolute;
  top: 90.25px;
  transform: translateX(100%) scale(0.9);
  left: calc(100% + 75px);
  z-index: 0;
`;

const Device08 = styled(motion(Image))`
  position: absolute;
  top: 50.35px;
  left: calc(100% + 220px);
  transform: scale(0.9);
  z-index: 1;
`;

const Wire08 = styled(motion(Image))`
  position: absolute;
  top: 0px;
  left: calc(100% + 194.75px);
  transform: scale(0.9);
  z-index: 0;
`;

const Device07 = styled(motion(Image))`
  position: absolute;
  top: 0px;
  transform: translateY(-80%) scale(0.9);
  left: calc(100% + 166.25px);
  z-index: 1;
`;

const Penguin = styled(motion(Image))`
  position: absolute;
  bottom: 50px;
  transform: translateY(50%) scale(0.9);
  left: calc(100% + 120px);
  z-index: 1;
`;

const Sparkles05 = styled(motion(Image))`
  position: absolute;
  bottom: 0px;
  transform: translateY(-80%) scale(0.9);
  left: calc(100% + 361px);
  z-index: 1;
`;

const Bird = styled(motion(Image))`
  position: absolute;
  top: -90.25px;
  transform: translateY(-100%) scale(0.9);
  left: calc(100% + 152px);
  z-index: 1;
`;

const Sparkles04 = styled(motion(Image))`
  position: absolute;
  top: -190px;
  transform: translateY(-80%) scale(0.9);
  left: calc(100% + 152px);
  z-index: 1;
`;

export default Screen;
