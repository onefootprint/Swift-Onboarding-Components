import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { IdDocImageTypes } from '@onefootprint/types';
import { LoadingIndicator, media } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useCountdown, useTimeout } from 'usehooks-ts';

import StickyBottomBox from '../../../../components/layout/components/sticky-bottom-box';
import Logger from '../../../../utils/logger';
import DESKTOP_INTERACTION_BOX_HEIGHT from '../../constants/desktop-interaction-box.constants';
import {
  AUTOCAPTURE_RESTART_DELAY,
  AUTOCAPTURE_TIMER_INTERVAL,
  FRAME_INSTRUCTION_TRANSITION_DELAY,
} from '../../constants/transition-delay.constants';
import type { CaptureKind } from '../../utils/state-machine';
import CaptureButton from './components/capture-button';
import CountdownTimer from './components/countdown-timer';
import Feedback from './components/feedback';
import Overlay from './components/overlay';
import UploadButton from './components/upload-button';
import type { AutocaptureKind } from './hooks/use-auto-capture';
import useAutoCapture from './hooks/use-auto-capture';
import useGetImageString from './hooks/use-get-image-string';
import useSize from './hooks/use-size';
import useUserMedia from './hooks/use-user-media';
import type { CameraKind } from './utils/get-camera-options';
import getOutlineDimensions from './utils/get-outline-dimensions';

export type DeviceKind = 'mobile' | 'desktop';
const AUTOCAPTURE_TIMER_START_VAL = 3;
const FEEFBACK_POSITION_FROM_BOTTOM_MOBILE = 150;
const FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP = 50;

type CameraProps = {
  onCapture: (image: string, captureKind: CaptureKind) => void;
  onError?: () => void;
  cameraKind: CameraKind;
  outlineWidthRatio: number; // with respect to the video width
  outlineHeightRatio: number; // with respect to the video width (not height since width is smaller)
  autocaptureKind: AutocaptureKind;
  deviceKind: DeviceKind;
  imageType: IdDocImageTypes;
};

const Camera = ({
  onCapture,
  onError,
  cameraKind,
  outlineWidthRatio,
  outlineHeightRatio,
  autocaptureKind,
  deviceKind,
  imageType,
}: CameraProps) => {
  const { t } = useTranslation('components.camera');
  const canvasRefAutoCapture = useRef<HTMLCanvasElement>();
  const canvasRefImageCapture = useRef<HTMLCanvasElement>();
  const videoRef = useRef<HTMLVideoElement>();
  const videoSize = useSize(videoRef);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [
    autoCaptureTimerVal,
    { startCountdown, stopCountdown, resetCountdown },
  ] = useCountdown({
    countStart: AUTOCAPTURE_TIMER_START_VAL,
    intervalMs: AUTOCAPTURE_TIMER_INTERVAL,
  });
  const [autocaptureFeedback, setAutocaptureFeedback] = useState<
    string | undefined
  >('detecting');
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [shouldDetect, setShouldDetect] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const getImageStringFromVideo = useGetImageString();
  const autocaptureRestartTimeout = useRef<NodeJS.Timeout>();

  const mediaStream = useUserMedia(cameraKind, onError);
  const isCameraVisible = !!mediaStream && isVideoPlaying;
  const { outlineWidth, outlineHeight } = getOutlineDimensions({
    videoSize,
    outlineHeightRatio,
    outlineWidthRatio,
    deviceKind,
  });
  const feedbackPositionFromBottom =
    deviceKind === 'mobile'
      ? FEEFBACK_POSITION_FROM_BOTTOM_MOBILE
      : FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP;
  const feedbackTop =
    deviceKind === 'mobile'
      ? (videoSize?.height ?? 0) - FEEFBACK_POSITION_FROM_BOTTOM_MOBILE
      : (videoSize?.height ?? 0) - FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP;

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  // We don't detect for 7.5 seconds while we show instruction texts
  useTimeout(
    () => {
      setShouldDetect(true);
    },
    isCameraVisible ? FRAME_INSTRUCTION_TRANSITION_DELAY : null,
  );

  const handleCanPlay = () => {
    if (!videoRef.current) {
      return;
    }
    setIsVideoPlaying(true);
    videoRef.current.play();
  };

  const handleClick = (captureKind: CaptureKind) => {
    if (!canvasRefImageCapture.current || !videoRef.current) {
      Logger.error(
        `Video ref or canvas not initialized for camera capture for capture kind: ${captureKind}`,
        'camera',
      );
      return;
    }

    const context = canvasRefImageCapture.current.getContext('2d');
    if (!context) {
      Logger.error(
        `Canvas context is undefined for camera capture for capture kind: ${captureKind}`,
        'camera',
      );
      return;
    }

    if (!videoSize) {
      Logger.error(
        `Cannot capture - videoSize not initilized: ${captureKind}`,
        'camera',
      );
      return;
    }

    const desiredImageWidth = videoSize.width; // We capture the full width
    let desiredImageHeight = videoSize.height; // We capture the full height for selfie

    // For document capture, we keep the captured width/height spect ratio same as the outline aspect ratio
    // In case maintaining the aspect ratio overflows the height, we take the full height (Math.min)
    if (autocaptureKind === 'document') {
      desiredImageHeight = Math.min(
        videoSize.height - feedbackPositionFromBottom,
        videoSize.width * (outlineHeightRatio / outlineWidthRatio),
      );
    }

    const yOffset =
      autocaptureKind === 'document' ? -feedbackPositionFromBottom / 2 : 0;

    const imageString = getImageStringFromVideo({
      context,
      videoRef,
      canvasRef: canvasRefImageCapture,
      mediaStream,
      desiredImageWidth,
      desiredImageHeight,
      autocaptureKind,
      centerOffsetY: yOffset,
    });

    if (imageString) {
      setIsCaptured(true);
      onCapture(imageString, captureKind);
    }
    clearCanvas();
  };

  const clearCanvas = () => {
    if (!canvasRefImageCapture.current) {
      Logger.warn('Canvas could not be cleared. Ref undefined', 'camera');
      return;
    }
    const context = canvasRefImageCapture.current.getContext('2d');
    if (!context) {
      Logger.warn('Canvas could not be cleared. Context undefined', 'camera');
      return;
    }
    context.clearRect(
      0,
      0,
      canvasRefImageCapture.current.width,
      canvasRefImageCapture.current.height,
    );
  };

  useEffect(() => {
    if (autoCaptureTimerVal <= 0) {
      stopCountdown();
      handleClick('auto');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCaptureTimerVal]);

  const onAutoDetectionComplete = () => {
    setIsTimerRunning(true);
    startCountdown();
  };

  const resetTimer = () => {
    resetCountdown();
    setIsTimerRunning(false);
  };

  useAutoCapture({
    videoRef,
    canvasRef: canvasRefAutoCapture,
    mediaStream,
    outlineWidth,
    outlineHeight,
    onComplete: onAutoDetectionComplete,
    onStatusChange: setAutocaptureFeedback,
    autocaptureKind,
    shouldDetect,
    isCaptured,
    onReset: resetTimer,
    outlineOffsetY: -feedbackPositionFromBottom / 2, // Negative Y direction (upward)
  });

  const onImageUpload = () => {
    setIsImageProcessing(true);
    setShouldDetect(false);
  };

  const onUploadComplete = () => {
    setIsImageProcessing(false);
    setShouldDetect(true);
  };

  const onMobileCaptureClick = () => {
    if (isTimerRunning) {
      resetTimer();
      setShouldDetect(false); // We can cancel the countdown
      const restartTimeout = setTimeout(
        () => setShouldDetect(true),
        AUTOCAPTURE_RESTART_DELAY,
      ); // We wait 1s before re-detecting and starting the countdown again
      autocaptureRestartTimeout.current = restartTimeout;
    } else {
      handleClick('manual');
    }
  };

  useEffect(() => () => clearTimeout(autocaptureRestartTimeout.current), []);

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
                height={feedbackTop}
                videoHeight={videoSize?.height ?? 0}
                captureKind={autocaptureKind}
                outlineWidth={outlineWidth}
                outlineHeight={outlineHeight}
                isCameraVisible={isCameraVisible}
                imageType={imageType}
                timerAnimationVal={
                  isTimerRunning ? autoCaptureTimerVal : undefined
                }
              />
              <Canvas
                ref={canvasRefImageCapture as React.Ref<HTMLCanvasElement>}
                width={videoSize?.width}
                height={videoSize?.height}
              />
              <Canvas
                ref={canvasRefAutoCapture as React.Ref<HTMLCanvasElement>}
                width={videoSize?.width}
                height={videoSize?.height}
              />
              {autocaptureFeedback && (
                <Feedback deviceKind={deviceKind} top={feedbackTop}>
                  {t(
                    `autocapture.feedback.${autocaptureKind}.${autocaptureFeedback}`,
                    {
                      side: imageType,
                    },
                  )}
                </Feedback>
              )}
              {deviceKind === 'mobile' && (
                <CaptureButton
                  onClick={onMobileCaptureClick}
                  variant={isTimerRunning ? 'stop' : 'round'}
                  disabled={!isCameraVisible || !videoSize}
                />
              )}
              {autocaptureKind === 'document' && (
                <UploadButton
                  onUpload={onImageUpload}
                  onComplete={onUploadComplete}
                />
              )}
              {isTimerRunning && (
                <TimerContainer height={feedbackTop}>
                  <CountdownTimer
                    current={autoCaptureTimerVal}
                    start={AUTOCAPTURE_TIMER_START_VAL}
                  />
                </TimerContainer>
              )}
            </>
          ) : (
            <ProcessingContainer>
              <LoadingIndicator />
            </ProcessingContainer>
          )}
        </VideoContainer>
        {deviceKind === 'desktop' && (
          <StickyBottomBox>
            <CaptureButton
              onClick={() => handleClick('manual')}
              disabled={!isCameraVisible || !videoSize}
              variant="default"
            />
          </StickyBottomBox>
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
      margin-bottom: calc(-1 * ${theme.spacing[8]});

      ${media.lessThan('md')`
        padding: 0 ${theme.spacing[3]}; 
      `}
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
      width: 100%;
      margin-bottom: calc(-1 * ${theme.spacing[8]});

      ${media.lessThan('md')`
        padding: 0 ${theme.spacing[3]}; 
      `}
    }

    &[data-device-kind='mobile'] {
      width: calc(100% + ${theme.spacing[8]});
      margin: calc(-1 * ${theme.spacing[5]});
    }
  `}
`;

export const Canvas = styled.canvas`
  visibility: hidden;
  position: absolute;
`;

const Video = styled.video`
  ${({ theme }) => css`
    height: 100%;
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

const TimerContainer = styled.div<{ height: number }>`
  ${({ height }) => css`
    width: 100%;
    display: flex;
    height: ${height}px;
    justify-content: center;
    align-items: center;
    position: absolute;
    border: none;
    background: none;
  `}
`;

export default Camera;
