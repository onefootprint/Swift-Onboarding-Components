import { useTranslation } from '@onefootprint/hooks';
import { Button, LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import imageBlobToBase64 from '../../../../utils/image-processing/image-blob-to-base64';
import Flash from './components/flash';
import Overlay from './components/overlay';
import useSize from './hooks/use-size';
import useUserMedia from './hooks/use-user-media';

type CameraProps = {
  onCapture: (image: string) => void;
  onError: () => void;
};

const CAPTURE_OPTIONS = {
  audio: false,
  video: { facingMode: 'user' },
};

const Camera = ({ onCapture, onError }: CameraProps) => {
  const { t } = useTranslation('pages.selfie-photo.camera');
  const canvasRef = useRef<HTMLCanvasElement>();
  const videoRef = useRef<HTMLVideoElement>();
  const videoSize = useSize(videoRef);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [image, setImage] = useState<string | undefined>();

  const mediaStream = useUserMedia(CAPTURE_OPTIONS, onError);
  const isCameraVisible = !!mediaStream && isVideoPlaying;

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  const handleCanPlay = () => {
    if (!videoRef.current) {
      return;
    }
    setIsVideoPlaying(true);
    videoRef.current.play();
  };

  const handleClick = () => {
    if (!canvasRef.current || !videoRef.current) {
      return;
    }

    const context = canvasRef.current.getContext('2d');
    if (!context) {
      return;
    }

    setShowInstructions(false);
    setIsFlashing(true);
    context.drawImage(
      videoRef.current,
      0,
      0,
      videoRef.current?.clientWidth,
      videoRef.current?.clientHeight,
    );

    // Capture the image when the flash starts but only call the onCapture
    // callback when flash animation is done This gives animation enough time
    // to complete. Taking the photo at the end of the animation would be
    // buggy if the user moved during the flash.
    canvasRef.current.toBlob(
      async (blob: Blob | null) => {
        if (blob) {
          const imageString = (await imageBlobToBase64(blob)) as string;
          setImage(imageString);
        }
      },
      'image/jpeg',
      1,
    );
  };

  const clearCanvas = () => {
    if (!canvasRef.current) {
      return;
    }
    const context = canvasRef.current.getContext('2d');
    if (!context) {
      return;
    }
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleFlashEnd = () => {
    if (image) {
      onCapture(image);
    }
    clearCanvas();
  };

  return (
    <>
      {!isCameraVisible && (
        <LoadingContainer>
          <LoadingIndicator />
        </LoadingContainer>
      )}
      <Container data-visible={isCameraVisible}>
        <VideoContainer>
          <Video
            ref={videoRef as React.Ref<HTMLVideoElement>}
            hidden={!isVideoPlaying}
            onCanPlay={handleCanPlay}
            autoPlay
            playsInline
            muted
          />
          <Overlay
            width={videoSize?.width ?? 0}
            height={videoSize?.height ?? 0}
          />
          <Canvas
            ref={canvasRef as React.Ref<HTMLCanvasElement>}
            width={videoSize?.width}
            height={videoSize?.height}
          />
          <Flash flash={isFlashing} onAnimationEnd={handleFlashEnd} />
          {showInstructions && (
            <Typography variant="label-3">{t('instructions')}</Typography>
          )}
        </VideoContainer>
        <Button fullWidth onClick={handleClick} variant="primary">
          {t('take')}
        </Button>
      </Container>
    </>
  );
};

const LoadingContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
`;

export const Container = styled.div`
  ${({ theme }) => css`
    visibility: hidden;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    row-gap: ${theme.spacing[5]};

    &[data-visible='true'] {
      visibility: visible;
    }
  `}
`;

const VideoContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    flex-grow: 1;
    flex-direction: column;
    row-gap: ${theme.spacing[5]};
  `}
`;

export const Canvas = styled.canvas`
  visibility: hidden;
  position: absolute;
`;

export const Video = styled.video`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    max-height: 100%;
    width: 100%;
    transform: scaleX(-1);

    &::-webkit-media-controls-play-button {
      display: none !important;
      -webkit-appearance: none;
    }
  `}
`;

export default Camera;
