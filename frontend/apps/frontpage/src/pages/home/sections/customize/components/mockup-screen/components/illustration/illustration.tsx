import { Box, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { memo } from 'react';
import styled, { css } from 'styled-components';

const rightFootVariants = {
  initial: {
    bottom: '50%',
    right: '52px',
    zIndex: 2,
  },
  rotate: {
    rotate: [0, 8, -8, 0, 8, -8, 0],
    y: [0, 5, -5, 0, 5, -5, 0],
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 0.5,
      repeatDelay: 5,
      ease: 'easeInOut',
    },
  },
};

const Illustration = () => (
  <StyledContainer>
    <Logo src="/home/customize-illustration/logo.svg" alt="Logo" width={140} height={65} />
    <MountainLeft src="/home/customize-illustration/mountain left.svg" alt="Mountain" width={500} height={280} />
    <MountainRight src="/home/customize-illustration/mountain-right.svg" alt="Mountain" width={520} height={290} />

    <CloudRight src="/home/customize-illustration/cloud-right.svg" alt="Cloud" width={100} height={100} />
    <CloudLeft src="/home/customize-illustration/cloud-left.svg" alt="Cloud" width={100} height={100} />
    <Characters>
      <Image src="/home/customize-illustration/characters.svg" alt="Characters" width={500} height={650} />
      <LeftFoot src="/home/customize-illustration/right-foot.svg" alt="Left Foot" width={50} height={50} />
      <MemoizedRightFootWrapper variants={rightFootVariants} initial="initial" animate="rotate">
        <Image src="/home/customize-illustration/right-foot.svg" alt="Right Foot" width={50} height={50} />
      </MemoizedRightFootWrapper>
    </Characters>
    <Ground />
  </StyledContainer>
);

const StyledContainer = styled(Box)`
  ${({ theme }) => css`
    position: relative;
    min-height: 320px;
    overflow: hidden;
    background-color: #cfbffe;
    overflow: hidden;
    border-radius: 0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg};
    isolation: isolate;

    ${media.greaterThan('md')`
      width: 100%;
    `}
  `}
`;

const MountainLeft = styled(Image)`
  position: absolute;
  top: 50%;
  left: 10%;
  z-index: 0;
  transform: translate(-50%, -50%) scale(0.7);
`;

const MountainRight = styled(Image)`
  position: absolute;
  top: 50%;
  right: 20%;
  z-index: 0;
  transform: translate(50%, -50%) scale(0.7);
`;

const Characters = styled(Box)`
  position: absolute;
  top: 60%;
  left: 45%;
  z-index: 3;
  transform: translate(-50%, -50%) scale(0.7);
  isolation: isolate;
`;

const Ground = styled(Box)`
  width: 100%;
  height: 36%;
  background-color: white;
  position: absolute;
  bottom: 0;
`;

const Logo = styled(Image)`
  position: absolute;
  top: 16px;
  left: 24px;
  z-index: 2;
`;

const CloudRight = styled(Image)`
  position: absolute;
  top: 10%;
  right: 5%;
  z-index: 0;
  transform: translate(50%, -50%);
`;

const CloudLeft = styled(Image)`
  position: absolute;
  top: 20%;
  left: 5%;
  z-index: 0;
  transform: translate(-50%, -50%);
`;

const LeftFoot = styled(Image)`
  position: absolute;
  bottom: 50%;
  right: 24px;
  z-index: 2;
  transform: translate(-50%, -50%) rotate(-20deg);
`;

const RightFootWrapper = styled(motion(Box))`
  position: absolute;
  width: fit-content;
`;

const MemoizedRightFootWrapper = memo(RightFootWrapper);

export default Illustration;
