import { IcoBolt24, IcoCirclePlay16, IcoUser24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import type { MotionValue } from 'framer-motion';
import {
  motion,
  useInView,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

type IllustrationOnboardProps = {
  scroll: MotionValue;
};

const VISIBLE_RANGE = {
  initial: 0,
  maxInitial: 0.1,
  maxFinal: 0.12,
  final: 0.14,
};

const IllustrationOnboard = ({ scroll }: IllustrationOnboardProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFirstPlay, setIsFirstPlay] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 'all' });

  const opacity = useTransform(
    scroll,
    [0, VISIBLE_RANGE.maxInitial, VISIBLE_RANGE.maxFinal],
    ['100%', '100%', '0%'],
  );
  const scaleOutCircle = useTransform(scroll, [0, 1], [1, 3]);
  const scaleCenterCircle = useTransform(scroll, [0, 1], [1, 2]);
  const scaleInnerCircle = useTransform(scroll, [0, 1], [1, 1.5]);

  useMotionValueEvent(scroll, 'change', latest => {
    if (latest > VISIBLE_RANGE.maxFinal) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  useEffect(() => {
    if (isInView && isFirstPlay) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isInView, isFirstPlay]);

  const handleEnded = () => {
    setIsPlaying(false);
    setIsFirstPlay(false);
  };

  return isVisible ? (
    <Container style={{ opacity }} ref={ref}>
      <PhoneContainer>
        <PhoneFrameImage
          src="/kyc/sticky-rail/iphone.png"
          alt=""
          width={375}
          height={812}
        />
        <ReactPlayer
          url="/kyc/sticky-rail/onboarding.mp4"
          muted
          config={{
            file: {
              attributes: {
                crossOrigin: 'true',
              },
            },
          }}
          playing={isPlaying}
          onEnded={() => {
            handleEnded();
          }}
          width={312}
          height={626}
          style={{
            position: 'absolute',
            objectFit: 'contain',
            zIndex: 0,
            transform: 'translate(-50%, -50%)',
            top: '50%',
            left: '50%',
            borderRadius: '56px',
            overflow: 'hidden',
          }}
        />
        {!isPlaying && !isFirstPlay && (
          <Replay
            onClick={() => setIsPlaying(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <IcoCirclePlay16 color="accent" />
            <Typography variant="label-2" color="accent">
              Replay
            </Typography>
          </Replay>
        )}
      </PhoneContainer>
      <motion.span
        animate={{
          rotate: [0, 360],
          transition: {
            duration: 20,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          },
        }}
      >
        <Circle diameter={600} style={{ scale: scaleOutCircle }}>
          <IconContainer
            data-type="bolt"
            animate={{
              rotate: [0, -360],
              transition: {
                duration: 20,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
              },
            }}
          >
            <IcoBolt24 />
          </IconContainer>
        </Circle>
      </motion.span>
      <motion.span
        animate={{
          rotate: [0, 360],
          transition: {
            duration: 25,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          },
        }}
      >
        <Circle diameter={480} style={{ scale: scaleCenterCircle }}>
          <IconContainer
            data-type="user"
            animate={{
              rotate: [0, -360],
              transition: {
                duration: 25,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
              },
            }}
          >
            <IcoUser24 />
          </IconContainer>
        </Circle>
      </motion.span>
      <Circle diameter={350} style={{ scale: scaleInnerCircle }} />
    </Container>
  ) : null;
};

const Container = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  user-select: none;
  touch-action: none;
`;

const Replay = styled(motion.button)`
  ${({ theme }) => css`
    all: unset;
    position: absolute;
    bottom: calc(-1 * ${theme.spacing[10]});
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[2]};
    cursor: pointer;
  `}
`;

const PhoneContainer = styled.div`
  ${({ theme }) => css`
    width: 320px;
    height: 650px;
    position: absolute;
    z-index: 1;
    border-radius: 56px;
    background-color: ${theme.backgroundColor.primary};
  `}
`;

const PhoneFrameImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`;

const Circle = styled(motion.div)<{ diameter: number }>`
  ${({ diameter, theme }) => css`
    width: ${diameter}px;
    height: ${diameter}px;
    border-radius: 50%;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: absolute;
    top: calc(50% - ${diameter}px / 2);
    left: calc(50% - ${diameter}px / 2);
    z-index: 0;
  `}
`;

const IconContainer = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    width: ${theme.spacing[8]};
    height: ${theme.spacing[8]};
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.backgroundColor.primary};
    border-radius: 50%;
    border: 1.5px solid ${theme.borderColor.tertiary};

    &[data-type='bolt'] {
      top: 12%;
      left: 12%;
    }

    &[data-type='user'] {
      top: 50%;
      left: calc(100% - 16px);
    }
  `}
`;

export default IllustrationOnboard;
