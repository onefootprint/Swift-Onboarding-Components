import { useTranslation } from '@onefootprint/hooks';
import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { Button, LoadingIndicator } from 'ui';

// https://linear.app/footprint/issue/FP-1442/resize-camera-dynamically
// TODO: uncomment below for resizing dynamically
// import Measure, { ContentRect, MeasureProps } from 'react-measure';
// import useCardRatio from '../../hooks/use-card-ratio';
import useOffsets from '../../hooks/use-offsets';
import useUserMedia from '../../hooks/use-user-media';
import Flash from '../flash/flash';

const CAPTURE_OPTIONS = {
  audio: false,
  video: { facingMode: 'environment' },
};

type CameraProps = {
  onCapture: (image: Blob) => void;
  onClear: () => void;
  onError: () => void;
};

const Camera = ({ onCapture, onClear, onError }: CameraProps) => {
  const { t } = useTranslation('components.take-or-upload-photo.take-photo');
  const canvasRef = useRef<HTMLCanvasElement | undefined>();
  const videoRef = useRef<HTMLVideoElement | undefined>();

  // TODO: uncomment below for resizing dynamically
  // const { aspectRatio, calculateRatio } = useCardRatio(1.586);
  // const [container, setContainer] = useState({ width: 0, height: 0 });
  // const handleResize = (contentRect: ContentRect) => {
  //   setContainer({
  //     width: contentRect.bounds.width,
  //     height: Math.round(contentRect.bounds.width / aspectRatio),
  //   });
  // };

  const container = { width: 400, height: 400 };

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);

  const mediaStream = useUserMedia(CAPTURE_OPTIONS, onError);

  const offsets = useOffsets(
    videoRef.current && videoRef.current.videoWidth,
    videoRef.current && videoRef.current.videoHeight,
    container.width,
    container.height,
  );

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  const handleCanPlay = () => {
    if (!videoRef.current) {
      return;
    }
    // TODO: uncomment below for resizing dynamically
    // calculateRatio(videoRef.current.videoHeight, videoRef.current.videoWidth);
    setIsVideoPlaying(true);
    videoRef.current.play();
  };

  const handleCapture = () => {
    if (!canvasRef.current || !videoRef.current) {
      return;
    }

    const context = canvasRef.current.getContext('2d');
    if (!context) {
      return;
    }

    // https://linear.app/footprint/issue/FP-1443/crop-out-borders-of-the-captured-image
    // TODO: edit this to crop out areas that fall outside the overlay
    context.drawImage(
      videoRef.current,
      offsets.x,
      offsets.y,
      container.width,
      container.height,
      0,
      0,
      container.width,
      container.height,
    );

    canvasRef.current.toBlob(
      (blob: Blob | null) => {
        if (blob) {
          onCapture(blob);
        }
      },
      'image/jpeg',
      1,
    );
    setIsCanvasEmpty(false);
    setIsFlashing(true);
  };

  const handleClear = () => {
    if (!canvasRef.current) {
      return;
    }
    const context = canvasRef.current.getContext('2d');
    if (!context) {
      return;
    }
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsCanvasEmpty(true);
    onClear();
  };

  if (!mediaStream) {
    return <LoadingIndicator />;
  }

  return (
    // TODO: uncomment below for resizing dynamically
    // <Measure bounds onResize={handleResize}>
    //   {({ measureRef }) => (
    <Wrapper>
      <Container
        // ref={measureRef}
        maxHeight={videoRef.current && videoRef.current.videoHeight}
        maxWidth={videoRef.current && videoRef.current.videoWidth}
        style={{
          height: `${container.height}px`,
        }}
      >
        <Video
          ref={videoRef as React.Ref<HTMLVideoElement>}
          hidden={!isVideoPlaying}
          onCanPlay={handleCanPlay}
          autoPlay
          playsInline
          muted
          style={{
            top: `-${offsets.y}px`,
            left: `-${offsets.x}px`,
          }}
        />
        <CameraOverlay hidden={!isVideoPlaying} />
        <Canvas
          ref={canvasRef as React.Ref<HTMLCanvasElement>}
          width={container.width}
          height={container.height}
        />
        <Flash
          isFlashing={isFlashing}
          onAnimationEnd={() => setIsFlashing(false)}
        />
      </Container>
      {!isVideoPlaying && <LoadingIndicator />}
      {isVideoPlaying && (
        <Button
          variant={isCanvasEmpty ? 'primary' : 'secondary'}
          fullWidth
          onClick={isCanvasEmpty ? handleCapture : handleClear}
          sx={{ marginTop: 7 }}
        >
          {isCanvasEmpty ? t('take') : t('retake')}
        </Button>
      )}
    </Wrapper>
    // TODO: uncomment below for resizing dynamically
    //   )}
    // </Measure>
  );
};

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  width: 100%;
`;

export const Container = styled.div<{ maxHeight?: number; maxWidth?: number }>`
  position: relative;
  width: 100%;
  max-width: ${({ maxWidth }) => maxWidth && `${maxWidth}px`};
  max-height: ${({ maxHeight }) => maxHeight && `${maxHeight}px`};
  overflow: hidden;

  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[2]}px;
  `}
`;

export const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
`;

export const Video = styled.video`
  position: absolute;

  &::-webkit-media-controls-play-button {
    display: none !important;
    -webkit-appearance: none;
  }
`;

const CameraOverlay = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 5%;
    right: 5%;
    bottom: 5%;
    left: 5%;
    box-shadow: ${theme.elevation[1]};
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius[2]}px;
  `}
`;

export default Camera;
