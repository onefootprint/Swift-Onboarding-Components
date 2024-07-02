import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const modalContainerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 1,
    },
  },
};

const modalVariant = {
  initial: {
    zIndex: 2,
    opacity: 0.5,
    transform: 'translate(0%, 20%)',
  },
  animate: {
    opacity: 1,
    transform: 'translate(0%, 0%)',
    transition: {
      duration: 1,
      ease: 'easeInOut',
    },
  },
};

const idVariant = {
  initial: {
    zIndex: 3,
    opacity: 0.8,
    transform: 'rotate(-10deg) translate(180%, 0%)',
  },
  animate: {
    opacity: 1,
    transform: 'rotate(10deg) translate(180%, -160%)',
    transition: {
      duration: 1,
      ease: 'easeInOut',
    },
  },
};

const Illustration = () => (
  <IllustrationContainer>
    <Background />
    <ModalContainer initial="initial" animate="animate" variants={modalContainerVariants}>
      <MotionWrapper variants={modalVariant} initial="initial" animate="animate">
        <Modal alt="" src="/auth/hero/bifrost-dialog.png" height={760} width={670} priority />
      </MotionWrapper>
      <MotionWrapper variants={idVariant} initial="initial" animate="animate">
        <FaceID alt="" src="/auth/hero/id.png" height={240} width={240} priority />
      </MotionWrapper>
    </ModalContainer>
  </IllustrationContainer>
);

const MotionWrapper = styled(motion.div)`
  width: fit-content;
`;

const ModalContainer = styled(motion.div)`
  ${({ theme }) => css`
    position: relative;
    height: 100%;
    mask: linear-gradient(180deg, black 0%, black 90%, transparent 100%);
    mask-mode: alpha;
    width: fit-content;
    transform: translateX(-50%);
    left: 50%;
    padding: ${theme.spacing[9]};
  `}
`;

const Modal = styled(Image)`
  ${({ theme }) => css`
    width: 364px;
    height: auto;
    box-shadow: ${theme.elevation[2]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
  `}
`;

const FaceID = styled(Image)`
  width: 120px;
  height: auto;
`;

const IllustrationContainer = styled.div`
  position: relative;
  width: 100%;
  height: 420px;
  overflow: hidden;
`;

const Background = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
  z-index: 0;
  width: 100%;
  height: 100%;
  background-image: url('/auth/hero/background.svg');
  background-size: 24px;
  background-position: center;
  background-repeat: repeat;
  mask: radial-gradient(
    40% 50% at 50% 50%,
    rgba(0, 0, 0, 0.2) 0%,
    transparent 100%
  );
  mask-mode: alpha;
  z-index: 0;
`;

export default Illustration;
