import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { IcoCheck24 } from '@onefootprint/icons';
import { Box, Stack, Text, createFontStyles } from '@onefootprint/ui';

const DOC_SCAN_WIDTH = 400;
const DOC_SCAN_HEIGHT = 280;

const idAnimationVariants = {
  initial: { opacity: 0, y: '-50%', x: '-50%' },
  animate: { opacity: 1, y: '12px', x: '-50%', transition: { delay: 1, duration: 1 } },
};

const cardVariants = {
  initial: { opacity: 0, filter: 'blur(20px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(20px)', transition: { duration: 1 } },
};

const counterVariants = {
  initial: { scale: 1, x: '-50%', y: '-50%' },
  animate: { scale: 1.3, x: '-50%', y: '-50%' },
};

const successContainerVariants = {
  initial: { opacity: 0, filter: 'blur(20px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(20px)', transition: { duration: 1 } },
};

const CaptureInformation = () => {
  const [count, setCount] = useState(3);
  const [counterStarted, setCounterStarted] = useState(false);
  const [counterFinished, setCounterFinished] = useState(false);

  const startCountdown = () => {
    setCounterStarted(true);
    const countdown = setInterval(() => {
      setCount(prevCount => {
        if (prevCount <= 1) {
          clearInterval(countdown);
          setCounterFinished(true);
          setCounterStarted(false);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  return (
    <Shade>
      <Frame
        $isSuccess={counterFinished}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        key="countdown"
      >
        <AnimatePresence>
          {counterFinished ? (
            <SuccessContainer variants={successContainerVariants} initial="initial" animate="animate" exit="exit">
              <IconOuterContainer>
                <IconContainer>
                  <IcoCheck24 color="success" />
                </IconContainer>
              </IconOuterContainer>
              <Text variant="label-4" color="success">
                ID successfully captured!
              </Text>
            </SuccessContainer>
          ) : (
            <IDContainer
              src="/home/doc-scan/fake-id.png"
              alt="Document Scan"
              width={1000 / 3}
              height={633 / 3}
              variants={idAnimationVariants}
              onAnimationComplete={startCountdown}
              initial="initial"
              animate="animate"
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {counterStarted && (
            <Counter variants={counterVariants} initial="initial" animate="animate" key={count}>
              {count}
            </Counter>
          )}
        </AnimatePresence>
      </Frame>
    </Shade>
  );
};

const Shade = styled(Box)`
${({ theme }) => css`
  mask: linear-gradient(to bottom, transparent 0%, black 10%, black 100%);
  mask-size: 100% 100%;
  mask-type: alpha;
  width: ${DOC_SCAN_WIDTH}px;
  height: ${DOC_SCAN_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[7]} ${theme.spacing[5]} ${theme.spacing[5]} ${theme.spacing[5]};
`}
`;

const SuccessContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[5]};
    justify-content: center;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
  `}
`;

const IDContainer = styled(motion(Image))`
  position: absolute;
`;

const Counter = styled(motion.div)`
  ${({ theme }) => css`
    ${createFontStyles('label-1')};
    color: ${theme.color.quinary};
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: ${theme.borderRadius.full};
    width: 40px;
    height: 40px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
  `}
`;

const flareAnimation = keyframes`
  0% {
    background-position: 0% 50%;
    filter: hue-rotate(0deg);
  }
  50% {
    background-position: 100% 50%;
    filter: hue-rotate(180deg);
  }
  100% {
    background-position: 0% 50%;
    filter: hue-rotate(360deg);
  }
`;

const Frame = styled(motion.div)<{ $isSuccess: boolean }>`
${({ theme, $isSuccess }) => css`
      position: relative;
      width: 100%;
      height: 100%;
      isolation: isolate;
      border-radius: ${theme.borderRadius.xl};
      background: ${$isSuccess ? 'linear-gradient(180deg, #E9F5F1 -56.76%, rgba(233, 245, 241, 0) 100%)' : 'radial-gradient(circle at center, rgba(255, 138, 0, 0.1), rgba(229, 46, 113, 0.05), transparent)'};
      box-shadow: 6px 4px 12px rgba(125, 10, 120, 0.08), -8px 4px 12px rgba(10, 10, 125, 0.08), 0px 4px 4px rgba(0, 0, 0, 0.11), 0px 0px 1px rgba(0, 0, 0, 0.15);
      ${
        !$isSuccess &&
        css`
        background-size: 200% 200%;
        animation: ${flareAnimation} 10s linear infinite;
        background-blend-mode: soft-light, normal;
      `
      }

    &::before {
      content: '';
      position: absolute;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.02), 0px 0px 4px rgba(0, 0, 0, 0.25) inset;
      border-radius: calc(${theme.borderRadius.xl} + 8px);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: calc(100% + 16px);
      height: calc(100% + 16px);
    }

    @supports not (aspect-ratio: 1.6) {
      height: 0;
      padding-bottom: calc(100% / 1.6);
    }
  `}
`;

const IconContainer = styled(Stack)`
  ${({ theme }) => css`
    width: fit-content;
    height: fit-content;
    position: relative;
    padding: ${theme.spacing[1]};
    border-radius: ${theme.borderRadius.full};
    align-items: center;
    justify-content: center;
    background-color: ${theme.backgroundColor.primary};
    box-shadow: 7px 4.667px 42px 0px #E9F5F1, -9.333px 14px 28px 0px #E9F5F1, 0px 1px 4px 0px rgba(0, 0, 0, 0.15);
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    overflow: hidden;
    background-blend-mode: soft-light, normal;
    z-index: 0;
  `}
`;

const IconOuterContainer = styled(Stack)`
  ${({ theme }) => css`
    width: fit-content;
    height: fit-content;
    padding: ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: 0px 4.667px 4.667px 0px rgba(0, 0, 0, 0.02), 0px 0px 4.667px 0px rgba(0, 0, 0, 0.25) inset; 
  `}
`;
export default CaptureInformation;
