import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { LoadingIndicator } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useTimeout } from 'usehooks-ts';

import { TRANSITION_DELAY_DEFAULT } from '../../constants/transition-delay.constants';
import CaptureButton from './components/capture-button';
import Feedback from './components/feedback';
import Flash from './components/flash';
import Overlay, { OutlineKind } from './components/overlay';
import UploadButton from './components/upload-button';
import useAutoCapture, { AutocaptureKind } from './hooks/use-auto-capture';
import useSize from './hooks/use-size';
import useUserMedia from './hooks/use-user-media';
import { CameraKind } from './utils/get-camera-options';
import getImageStringFromVideo from './utils/get-image-string-from-video';
import getVideoHeight from './utils/get-video-height';

type CameraProps = {
  onCapture: (image: string) => void;
  onError: () => void;
  cameraKind: CameraKind;
  outlineWidthRatio: number; // with respect to the video width
  outlineHeightRatio: number; // with respect to the video width (not height since width is smaller)
  outlineKind: OutlineKind;
  autocaptureKind: AutocaptureKind;
};

const Camera = ({
  onCapture,
  onError,
  cameraKind,
  outlineWidthRatio,
  outlineHeightRatio,
  outlineKind,
  autocaptureKind,
}: CameraProps) => {
  const { t } = useTranslation('components.camera');
  const canvasRef = useRef<HTMLCanvasElement>();
  const videoRef = useRef<HTMLVideoElement>();
  const videoSize = useSize(videoRef);
  const [videoHeight, setVideoHeight] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [image, setImage] = useState<string | undefined>();
  const [autocaptureFeedback, setAutocaptureFeedback] = useState<
    string | undefined
  >();
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [shouldDetect, setShouldDetect] = useState(true); // TODO: Completely remove the use of this hook by moving the image processing to the processing component
  const [shouldShowInstructions, setShouldShowInstruction] = useState(true);
  const [canCapture, setCanCapture] = useState(false);

  const mediaStream = useUserMedia(cameraKind, onError);
  const isCameraVisible = !!mediaStream && isVideoPlaying;

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  useEffect(() => {
    setVideoHeight(getVideoHeight());
  }, []);

  // Initially we show the instruction text for 1.5 seconds
  useEffect(() => {
    setAutocaptureFeedback(`init-${autocaptureKind}`);
  }, [autocaptureKind]);

  // During the 1.5 seconds when we show instruction text, we do the following:
  // 1. We keep manual capture button disabled
  // 2. We don't allow changing the feedback text until the 1.5 seconds have passed
  // Detection may start working before 1.5 seconds if everything (video, model, etc) is initialized
  // After 1.5 seconds we enable manual capture, and we let the detection algorithm change the feedback text
  // Since detection algorithm might have a delay before the current iteration completes, we set the feedback text to "detecting ..."
  useTimeout(
    () => {
      setShouldShowInstruction(false);
      setCanCapture(true);
      if (autocaptureFeedback === 'init') setAutocaptureFeedback('detecting');
    },
    isCameraVisible ? TRANSITION_DELAY_DEFAULT : null,
  );

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
    setCanCapture(false);

    // We capture the full width
    // We keep the captured width/height spect ratio same as the outline aspect ratio
    // In case maintaining the aspect ratio overflows the height, we take the full height (Math.min)
    const desiredImageWidth = videoRef.current.clientWidth;
    const desiredImageHeight = Math.min(
      videoRef.current.clientHeight,
      videoRef.current.clientWidth * (outlineHeightRatio / outlineWidthRatio),
    );

    // Capture the image when the flash starts but only call the onCapture
    // callback when flash animation is done This gives animation enough time
    // to complete. Taking the photo at the end of the animation would be
    // buggy if the user moved during the flash.
    const imageString = getImageStringFromVideo({
      context,
      videoRef,
      canvasRef,
      mediaStream,
      desiredImageWidth,
      desiredImageHeight,
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

  useAutoCapture({
    videoRef,
    canvasRef,
    mediaStream,
    outlineWidth: videoSize ? videoSize.width * outlineWidthRatio : 0,
    outlineHeight: videoSize ? videoSize.width * outlineHeightRatio : 0,
    onCapture: handleClick,
    onStatusChange: setAutocaptureFeedback,
    autocaptureKind,
    shouldDetect,
    shouldShowInstructions,
  });

  const onImageUpload = () => {
    setIsImageProcessing(true);
    setShouldDetect(false);
  };

  const onUploadComplete = () => {
    setIsImageProcessing(false);
    setShouldDetect(true);
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
            height={videoHeight}
            data-camera-kind={cameraKind}
            autoPlay
            playsInline
            muted
          />
          {!isImageProcessing ? (
            <>
              <Overlay
                width={videoSize?.width ?? 0}
                height={videoSize?.height ?? 0}
                outlineKind={outlineKind}
                outlineWidth={
                  videoSize ? videoSize.width * outlineWidthRatio : 0
                }
                outlineHeight={
                  videoSize ? videoSize.width * outlineHeightRatio : 0
                }
              />
              <Canvas
                ref={canvasRef as React.Ref<HTMLCanvasElement>}
                width={videoSize?.width}
                height={videoSize?.height}
              />
              <Flash flash={isFlashing} onAnimationEnd={handleFlashEnd} />
              {shouldDetect && autocaptureFeedback && (
                <Feedback>
                  {t(`autocapture.feedback.${autocaptureFeedback}`)}
                </Feedback>
              )}
              <CaptureButton onClick={handleClick} disabled={!canCapture} />
              {autocaptureKind === 'document' && (
                <UploadButton
                  onUpload={onImageUpload}
                  onComplete={onUploadComplete}
                />
              )}
            </>
          ) : (
            <ProcessingContainer>
              <LoadingIndicator />
            </ProcessingContainer>
          )}
        </VideoContainer>
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
    margin-left: calc(-1 * ${theme.spacing[5]});
    margin-right: calc(-1 * ${theme.spacing[5]});
    margin-bottom: calc(-1 * ${theme.spacing[5]});
    margin-top: calc(-1 * ${theme.spacing[5]});
  `}
`;

export const Canvas = styled.canvas`
  visibility: hidden;
  position: absolute;
`;

const Video = styled.video<{ height: number }>`
  ${({ height }) => css`
    height: ${height}px;
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

const ProcessingContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0.75;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.backgroundColor.primary};
  `}
`;

export default Camera;
