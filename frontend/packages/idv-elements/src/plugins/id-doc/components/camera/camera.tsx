import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { LoadingIndicator } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useTimeout } from 'usehooks-ts';

import DESKTOP_INTERACTION_BOX_HEIGHT from '../../constants/desktop-interaction-box.constants';
import { TRANSITION_DELAY_DEFAULT } from '../../constants/transition-delay.constants';
import CaptureButton from './components/capture-button';
import Feedback from './components/feedback';
import Flash from './components/flash';
import type { OutlineKind } from './components/overlay';
import Overlay from './components/overlay';
import UploadButton from './components/upload-button';
import type { AutocaptureKind } from './hooks/use-auto-capture';
import useAutoCapture from './hooks/use-auto-capture';
import useGetImageString from './hooks/use-get-image-string';
import useSize from './hooks/use-size';
import useUserMedia from './hooks/use-user-media';
import type { CameraKind } from './utils/get-camera-options';
import getOutlineDimensions from './utils/get-outline-dimensions';
import getVideoHeight from './utils/get-video-height';

export type DeviceKind = 'mobile' | 'desktop';

type CameraProps = {
  onCapture: (image: string) => void;
  onError?: () => void;
  cameraKind: CameraKind;
  outlineWidthRatio: number; // with respect to the video width
  outlineHeightRatio: number; // with respect to the video width (not height since width is smaller)
  outlineKind: OutlineKind;
  autocaptureKind: AutocaptureKind;
  deviceKind: DeviceKind;
};

const Camera = ({
  onCapture,
  onError,
  cameraKind,
  outlineWidthRatio,
  outlineHeightRatio,
  outlineKind,
  autocaptureKind,
  deviceKind,
}: CameraProps) => {
  const { t } = useTranslation('components.camera');
  const canvasRef = useRef<HTMLCanvasElement>();
  const videoRef = useRef<HTMLVideoElement>();
  const videoSize = useSize(videoRef);
  const [videoHeight, setVideoHeight] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [autocaptureFeedback, setAutocaptureFeedback] = useState<
    string | undefined
  >();
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [shouldDetect, setShouldDetect] = useState(true); // TOD O: Completely remove the use of this hook by moving the image processing to the processing component
  const [shouldShowInstructions, setShouldShowInstruction] = useState(true);
  const [canCapture, setCanCapture] = useState(true);
  const getImageStringFromVideo = useGetImageString();

  const mediaStream = useUserMedia(cameraKind, onError);
  const isCameraVisible = !!mediaStream && isVideoPlaying;
  const { outlineWidth, outlineHeight } = getOutlineDimensions({
    videoSize,
    outlineHeightRatio,
    outlineWidthRatio,
    deviceKind,
  });

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  useEffect(() => {
    if (deviceKind === 'mobile') setVideoHeight(getVideoHeight());
    else setVideoHeight(DESKTOP_INTERACTION_BOX_HEIGHT);
  }, [deviceKind]);

  // Initially we show the instruction text for 1.5 seconds
  useEffect(() => {
    setAutocaptureFeedback(`init-${autocaptureKind}`);
  }, [autocaptureKind]);

  // During the 1.5 seconds when we show instruction text, we do the following:
  // We don't allow changing the feedback text until the 1.5 seconds have passed
  // Detection may start working before 1.5 seconds if everything (video, model, etc) is initialized
  // After 1.5 seconds, we let the detection algorithm change the feedback text
  // Since detection algorithm might have a delay before the current iteration completes, we set the feedback text to "detecting ..."
  useTimeout(
    () => {
      setShouldShowInstruction(false);
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
      console.error('Video ref or canvas not initialized for camera capture');
      return;
    }

    const context = canvasRef.current.getContext('2d');
    if (!context) {
      console.error('Canvas context is undefined for camera capture');
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
      shouldSharpen: false,
    });

    if (imageString) {
      onCapture(imageString);
    } else {
      setCanCapture(true); // if the no picture was taken successfully, reenable the capture button
    }
    clearCanvas();
  };

  const clearCanvas = () => {
    if (!canvasRef.current) {
      console.warn('Canvas could not be cleared. Ref undefined');
      return;
    }
    const context = canvasRef.current.getContext('2d');
    if (!context) {
      console.warn('Canvas could not be cleared. Context undefined');
      return;
    }
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  useAutoCapture({
    videoRef,
    canvasRef,
    mediaStream,
    outlineWidth,
    outlineHeight,
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
        <LoadingContainer
          data-device-kind={deviceKind}
          desktopHeight={DESKTOP_INTERACTION_BOX_HEIGHT}
        >
          <LoadingIndicator />
        </LoadingContainer>
      )}
      <Container data-visible={isCameraVisible}>
        <VideoContainer data-device-kind={deviceKind}>
          <Video
            ref={videoRef as React.Ref<HTMLVideoElement>}
            hidden={!isVideoPlaying}
            onCanPlay={handleCanPlay}
            height={videoHeight}
            data-camera-kind={cameraKind}
            data-device-kind={deviceKind}
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
                outlineWidth={outlineWidth}
                outlineHeight={outlineHeight}
              />
              <Canvas
                ref={canvasRef as React.Ref<HTMLCanvasElement>}
                width={videoSize?.width}
                height={videoSize?.height}
              />
              <Flash flash={isFlashing} />
              {shouldDetect && autocaptureFeedback && (
                <Feedback>
                  {t(`autocapture.feedback.${autocaptureFeedback}`)}
                </Feedback>
              )}
              {deviceKind === 'mobile' && (
                <CaptureButton
                  onClick={handleClick}
                  disabled={!canCapture}
                  variant="round"
                />
              )}
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
        {deviceKind === 'desktop' && (
          <CaptureButton
            onClick={handleClick}
            disabled={!canCapture}
            variant="default"
          />
        )}
      </Container>
    </>
  );
};

const LoadingContainer = styled.div<{
  desktopHeight: number;
}>`
  ${({ theme, desktopHeight }) => css`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-content: center;

    &[data-device-kind='desktop'] {
      min-height: ${desktopHeight}px;
      background-color: ${theme.backgroundColor.secondary};
      border-radius: ${theme.borderRadius.default};
    }
  `}
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
    row-gap: ${theme.spacing[7]};

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

    &[data-device-kind='desktop'] {
      width: calc(100% + ${theme.spacing[2]});
    }

    &[data-device-kind='mobile'] {
      width: calc(100% + ${theme.spacing[8]});
      margin-left: calc(-1 * ${theme.spacing[5]});
      margin-right: calc(-1 * ${theme.spacing[5]});
      margin-bottom: calc(-1 * ${theme.spacing[5]});
      margin-top: calc(-1 * ${theme.spacing[5]});
    }
  `}
`;

export const Canvas = styled.canvas`
  visibility: hidden;
  position: absolute;
`;

const Video = styled.video<{ height: number }>`
  ${({ theme, height }) => css`
    height: ${height}px;
    width: 100%;
    object-fit: cover; // Should be "cover" for the math to work

    &[data-camera-kind='front'] {
      transform: scaleX(
        -1
      ); // Mirror the image only if we are using the front camera
    }

    &[data-device-kind='desktop'] {
      border-radius: ${theme.borderRadius.default};
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
