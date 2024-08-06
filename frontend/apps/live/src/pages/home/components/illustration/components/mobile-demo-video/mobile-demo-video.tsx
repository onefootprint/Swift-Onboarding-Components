import { primitives } from '@onefootprint/design-tokens';
import { IcoCirclePlay24 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import styled, { css } from 'styled-components';

type MobileDemoVideoProps = {
  videoUrl: string;
  height?: number;
  width?: number;
  className?: string;
};

const FACTOR_PHONE_SCREEN = 1.2971246006;

const MobileDemoVideo = ({ videoUrl, height = 812, width = 375, className }: MobileDemoVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWindow, setHasWindow] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }
    const timeout = setTimeout(() => {
      setIsPlaying(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const handleReplay = () => {
    setIsPlaying(true);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsFirstTime(false);
  };

  return (
    <PhoneContainer className={className}>
      <PhoneFrameImage src="/iphone.png" alt="" width={width} height={height} priority />
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
      {!isPlaying && !isFirstTime && (
        <Replay onClick={handleReplay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <IcoCirclePlay24 color="accent" />
          <Text variant="label-1" color="accent">
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
    transition: background-color 0.2s ease-in-out;
    padding: ${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[2]}
      ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.default};

    &:hover {
      background-color: #4a24db09;
      svg {
        path {
          fill: ${primitives.Purple600};
        }
      }
      p {
        color: ${primitives.Purple600};
      }
    }
  `}
`;

export default MobileDemoVideo;
