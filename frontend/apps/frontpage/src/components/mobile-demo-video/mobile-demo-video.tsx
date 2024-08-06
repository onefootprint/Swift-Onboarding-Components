import { IcoCirclePlay16 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import styled, { css } from 'styled-components';

type MobileDemoVideoProps = {
  videoUrl: string;
  shouldPlay?: boolean;
  height?: number;
  width?: number;
  className?: string;
  onPlayFinish?: () => void;
  hideReplay?: boolean;
  hideNotch?: boolean;
};

const FACTOR_PHONE_SCREEN = 1.2971246006;

const MobileDemoVideo = ({
  videoUrl,
  shouldPlay,
  height = 812,
  width = 375,
  className,
  onPlayFinish,
  hideReplay,
  hideNotch,
}: MobileDemoVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFirstPlay, setIsFirstPlay] = useState(true);
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
    if (onPlayFinish) {
      onPlayFinish();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }
  }, []);

  return (
    <PhoneContainer className={className}>
      <PhoneFrameImage src={hideNotch ? '/iphone-no-notch.png' : '/iphone.png'} alt="" width={width} height={height} />
      {hasWindow && (
        <ReactPlayer
          url={videoUrl}
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
    </PhoneContainer>
  );
};

const PhoneFrameImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
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

export default MobileDemoVideo;
