import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, LoadingIndicator } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';

import Flash from './components/flash';
import Overlay from './components/overlay';
import { OutlineKind } from './components/overlay/overlay';
import useSize from './hooks/use-size';
import useUserMedia from './hooks/use-user-media';
import getImageStringFromVideo from './utils/get-image-string-from-video';

export type CameraKind = 'front' | 'back';

type CameraProps = {
  onCapture: (image: string) => void;
  onError: () => void;
  cameraKind: CameraKind;
  maxVideoHeight: number;
  outlineWidthRatio: number; // with respect to the video height (not width)
  outlineHeightRatio: number; // with respect to the video height
  outlineKind: OutlineKind;
};

const FRONT_CAMERA_OPTIONS = {
  audio: false,
  video: { facingMode: 'user' },
};

const BACK_CAMERA_OPTIONS = {
  audio: false,
  video: { facingMode: 'environment' },
};

const Camera = ({
  onCapture,
  onError,
  cameraKind,
  maxVideoHeight,
  outlineWidthRatio,
  outlineHeightRatio,
  outlineKind,
}: CameraProps) => {
  const { t } = useTranslation('components.camera');
  const canvasRef = useRef<HTMLCanvasElement>();
  const videoRef = useRef<HTMLVideoElement>();
  const videoSize = useSize(videoRef);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [image, setImage] = useState<string | undefined>();

  const mediaStream = useUserMedia(
    cameraKind === 'front' ? FRONT_CAMERA_OPTIONS : BACK_CAMERA_OPTIONS,
    onError,
  );
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

    setIsFlashing(true);

    // Capture the image when the flash starts but only call the onCapture
    // callback when flash animation is done This gives animation enough time
    // to complete. Taking the photo at the end of the animation would be
    // buggy if the user moved during the flash.
    const imageString = getImageStringFromVideo({
      context,
      videoRef,
      canvasRef,
      desiredImageWidth: videoRef.current?.clientWidth,
      desiredImageHeight: videoRef.current?.clientHeight,
    });

    setImage(imageString || undefined);
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
            maxHeight={maxVideoHeight}
            data-camera-kind={cameraKind}
            autoPlay
            playsInline
            muted
          />
          <Overlay
            width={videoSize?.width ?? 0}
            height={videoSize?.height ?? 0}
            outlineKind={outlineKind}
            outlineWidth={videoSize ? videoSize.height * outlineWidthRatio : 0}
            outlineHeight={
              videoSize ? videoSize.height * outlineHeightRatio : 0
            }
          />
          <Canvas
            ref={canvasRef as React.Ref<HTMLCanvasElement>}
            width={videoSize?.width}
            height={videoSize?.height}
          />
          <Flash flash={isFlashing} onAnimationEnd={handleFlashEnd} />
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
    flex-grow: 1;
    flex-direction: column;
    width: calc(100% + ${theme.spacing[8]});
    row-gap: ${theme.spacing[5]};
    margin-left: calc(-1 * ${theme.spacing[5]});
    margin-right: calc(-1 * ${theme.spacing[5]});
    margin-bottom: ${theme.spacing[8]};
  `}
`;

export const Canvas = styled.canvas`
  visibility: hidden;
  position: absolute;
`;

const Video = styled.video<{ maxHeight: number }>`
  ${({ maxHeight }) => css`
    max-height: ${maxHeight}px;
    width: 100%;
    object-fit: cover; // Should be "cover" for the math to work

    &[data-camera-kind='front'] {
      transform: scaleX(
        -1
      ); // Mirror the image only if we are using the front camera
    }

    &::-webkit-media-controls-play-button {
      display: none !important;
      -webkit-appearance: none;
    }
  `}
`;

export default Camera;
