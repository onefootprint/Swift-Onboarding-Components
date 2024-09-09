import { IcoCheckCircle24 } from '@onefootprint/icons';
import { Box, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { keyframes } from 'styled-components';

const frameVariants = {
  initial: {
    width: '80%',
    height: '80%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  animate: {
    width: ['80%', '75%', '95%', '80%'],
    height: ['80%', '75%', '95%', '80%'],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: 'loop' as const,
    },
  },
};

const captureVariants = {
  initial: {
    opacity: 0,
    filter: 'blur(20px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(20px)',
    transition: {
      duration: 0.5,
    },
  },
};

const successVariants = {
  initial: {
    filter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  animate: {
    filter: 'blur(0px)',
    transition: {
      duration: 1,
    },
  },
};

type ScreenProps = {
  shouldAnimate: boolean;
};

const Screen = ({ shouldAnimate }: ScreenProps) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => {
        setShowSuccess(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  return (
    <AnimatePresence>
      {shouldAnimate && showSuccess ? (
        <SuccessContainer variants={successVariants} initial="initial" animate="animate">
          <Message>
            <IcoCheckCircle24 color="success" />
            <Stack gap={1} direction="column">
              <Text variant="label-3">Success!</Text>
            </Stack>
          </Message>
          <Blur>
            <WhiteSheet />
            <Rainbow />
          </Blur>
        </SuccessContainer>
      ) : (
        <CaptureContainer variants={captureVariants} initial="initial" animate="animate" exit="exit">
          <Frame
            fill="none"
            height="300"
            viewBox="0 0 300 300"
            width="300"
            xmlns="http://www.w3.org/2000/svg"
            variants={frameVariants}
            initial="initial"
            animate="animate"
          >
            <g fill="#fff">
              <path d="m75.0001 3c0-1.65685-1.3432-3-3-3h-48.3307c-13.0722 0-23.6694 10.5972-23.6694 23.6694v48.3306c0 1.6568 1.34315 3 3 3s3-1.3432 3-3v-48.3306c0-9.7585 7.9109-17.6694 17.6694-17.6694h48.3307c1.6568 0 3-1.34315 3-3z" />
              <path d="m297 75c-1.657 0-3-1.3432-3-3v-48.3306c0-9.7585-7.911-17.6694-17.669-17.6694h-48.331c-1.657 0-3-1.34315-3-3s1.343-3 3-3h48.331c13.072 0 23.669 10.5972 23.669 23.6694v48.3306c0 1.6568-1.343 3-3 3z" />
              <path d="m225 297c0-1.657 1.343-3 3-3h48.331c9.758 0 17.669-7.911 17.669-17.669v-48.331c0-1.657 1.343-3 3-3s3 1.343 3 3v48.331c0 13.072-10.597 23.669-23.669 23.669h-48.331c-1.657 0-3-1.343-3-3z" />
              <path d="m3 225c1.65685 0 3 1.343 3 3v48.331c0 9.758 7.9109 17.669 17.6694 17.669h48.3307c1.6568 0 3 1.343 3 3s-1.3432 3-3 3h-48.3307c-13.0722 0-23.6694-10.597-23.6694-23.669v-48.331c0-1.657 1.34315-3 3-3z" />
            </g>
          </Frame>
          <PromptContainer>Hold still... </PromptContainer>
        </CaptureContainer>
      )}
    </AnimatePresence>
  );
};

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const hueRotation = keyframes`
  0% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(180deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
`;

const SuccessContainer = styled(motion(Box))`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    position: relative;
    isolation: isolate;
    border-radius: 30px;
    overflow: hidden;
`;

const Message = styled(Stack)`
  ${({ theme }) => css`
    text-align: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    z-index: 3;
    gap: ${theme.spacing[3]};
    align-items: center;
    justify-content: center;
    color: ${theme.color.success};
    padding: ${theme.spacing[4]};

    svg {
      transform: scale(1.2);
    }
  `}
`;

const Blur = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(4px);
  @supports not (backdrop-filter: blur(4px)) {
    background-color: rgba(255, 255, 255, 0.7);
  }
  z-index: 1;
`;

const WhiteSheet = styled(Box)`
  ${({ theme }) => css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(100% - ${theme.spacing[4]});
    height: calc(100% - ${theme.spacing[4]});
    transform: translate(-50%, -50%);
    background: rgb(255, 255, 255, 1);
    z-index: 2;
    border-radius: 23px;

  `}
`;

const Rainbow = styled(Box)`
  ${({ theme }) => css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    background: conic-gradient(
      from 0deg at 50% 50%,
      ${theme.backgroundColor.primary} 0deg,
      rgba(255, 0, 0, 1) 45deg,
      rgba(255, 154, 0, 1) 90deg,
      rgba(208, 222, 33, 1) 135deg,
      rgba(79, 220, 74, 1) 180deg,
      rgba(63, 218, 216, 1) 225deg,
      rgba(47, 201, 226, 1) 270deg,
      rgba(139, 0, 255, 1) 315deg,
      ${theme.backgroundColor.primary} 360deg
    );
    background-size: 100% 100%;
    animation: ${gradientAnimation} 40s linear infinite, ${hueRotation} 5s linear infinite;
    z-index: 1;
  `}
`;

const CaptureContainer = styled(motion(Box))`
  background: url('/doc-scan/selfie.webp') no-repeat center center;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: relative;
  border-radius: 30px;
  overflow: hidden;
`;

const Frame = styled(motion.svg)`
  position: absolute;
`;

const PromptContainer = styled(Box)`
  ${({ theme }) => css`
  ${createFontStyles('label-3')}
    position: absolute;
    bottom: ${theme.spacing[3]};
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.5);
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.sm};
    white-space: nowrap;
    color: ${theme.color.quinary};
    box-shadow: ${theme.elevation[2]};
  `}
`;

export default Screen;
