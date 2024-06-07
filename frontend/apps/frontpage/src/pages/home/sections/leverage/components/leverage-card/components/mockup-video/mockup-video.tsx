import { IcoCirclePlay16 } from '@onefootprint/icons';
import { Box, Text } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import styled, { css } from 'styled-components';

type MockupVideoProps = {
  videoSrc: string;
  shouldPlay?: boolean;
  height?: number;
  width?: number;
  className?: string;
  onComplete?: () => void;
  hideReplay?: boolean;
};

const FACTOR_PHONE_SCREEN = 1.2971246006;

const MockupVideo = ({
  videoSrc,
  shouldPlay,
  height = 812,
  width = 375,
  className,
  onComplete,
  hideReplay,
}: MockupVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(shouldPlay);
  const [isFirstPlay, setIsFirstPlay] = useState(false);
  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    if (shouldPlay && isFirstPlay) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [shouldPlay, isFirstPlay]);

  const handleEnded = () => {
    setIsPlaying(false);
    setIsFirstPlay(false);
    if (onComplete) {
      onComplete();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }
  }, []);
  return (
    <PlayerContainer>
      <PhoneContainer className={className}>
        <PhoneFrameImage src="/iphone-no-notch.png" alt="" width={width} height={height} />
        {hasWindow && (
          <ReactPlayer
            url={videoSrc}
            muted
            config={{
              file: {
                attributes: {
                  crossOrigin: 'true',
                },
              },
            }}
            playing
            loop
            playsinline
            onEnded={handleEnded}
            width={width / FACTOR_PHONE_SCREEN}
            height="auto"
            style={{
              position: 'absolute',
              objectFit: 'contain',
              zIndex: 0,
              transform: 'translate(-50%, -50%)',
              top: '50%',
              left: '50%',
            }}
          />
        )}
      </PhoneContainer>
      {!isPlaying && !isFirstPlay && !hideReplay && (
        <Replay
          onClick={() => setIsPlaying(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <IcoCirclePlay16 color="accent" />
          <Text variant="label-2" color="accent">
            Replay
          </Text>
        </Replay>
      )}
    </PlayerContainer>
  );
};

const PlayerContainer = styled(Box)`
  ${({ theme }) => css`
    grid-area: video;
    position: relative;
    width: 100%;
    height: 360px;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
  `}
`;

const PhoneContainer = styled.div`
  ${({ theme }) => css`
    width: 320px;
    height: 660px;
    position: absolute;
    z-index: 1;
    border-radius: 56px;
    overflow: hidden;
    background-color: ${theme.backgroundColor.primary};
    top: 0%;
    left: 50%;
    transform: translate(-50%, -35%) scale(0.7);

    video {
      border-radius: 54px;
      overflow: hidden;
    }
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

export default MockupVideo;
