import { useCountdownCustom, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import { LoadingIndicator, media } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useTimeout } from 'usehooks-ts';

import StickyBottomBox from '../../../../components/layout/components/sticky-bottom-box';
import Logger from '../../../../utils/logger';
import DESKTOP_INTERACTION_BOX_HEIGHT from '../../constants/desktop-interaction-box.constants';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import {
  AUTOCAPTURE_RESTART_DELAY,
  AUTOCAPTURE_START_DELAY,
  AUTOCAPTURE_TIMER_INTERVAL,
} from '../../constants/transition-delay.constants';
import type { CaptureKind } from '../../utils/state-machine';
import CaptureButton from './components/capture-button';
import CountdownTimer from './components/countdown-timer';
import Feedback from './components/feedback';
import Overlay from './components/overlay';
import UploadButton from './components/upload-button';
import useGetImageString from './hooks/use-get-image-string';
import useSize from './hooks/use-size';
import useUserMedia from './hooks/use-user-media';
import type {
  AutocaptureKind,
  CaptureStatus,
  VideoRef,
  VideoSize,
} from './types';
import type { CameraKind } from './utils/get-camera-options';
import getOutlineDimensions from './utils/get-outline-dimensions';

export type DeviceKind = 'mobile' | 'desktop';
type ChildrenProps = {
  canvasAutoCaptureRef: React.MutableRefObject<HTMLCanvasElement | undefined>;
  feedbackPositionFromBottom: number;
  mediaStream: MediaStream | null;
  onDetectionComplete: () => void;
  onDetectionReset: () => void;
  outlineHeight: number;
  outlineWidth: number;
  videoRef: VideoRef;
  videoSize: VideoSize | undefined;
};
type CameraProps = {
  autocaptureKind: AutocaptureKind;
  cameraKind: CameraKind;
  children: (props: ChildrenProps) => JSX.Element | null;
  deviceKind: DeviceKind;
  docType?: SupportedIdDocTypes;
  imageType: IdDocImageTypes;
  onCapture: (image: string, captureKind: CaptureKind) => void;
  onError?: () => void;
  outlineHeightRatio: number; // with respect to the video width (not height since width is smaller)
  outlineWidthRatio: number; // with respect to the video width
  setIsCaptured: React.Dispatch<React.SetStateAction<boolean>>;
  autocaptureFeedback?: CaptureStatus;
};

const AUTOCAPTURE_TIMER_START_VAL = 3;
const FEEFBACK_POSITION_FROM_BOTTOM_MOBILE = 150;
const FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP = 50;
const CountDownProps = {
  countStart: AUTOCAPTURE_TIMER_START_VAL,
  intervalMs: AUTOCAPTURE_TIMER_INTERVAL,
};

const isDesktop = (x: unknown) => x === 'desktop';
const isDocument = (x: unknown) => x === 'document';
const isMobile = (x: unknown) => x === 'mobile';
const logError = (e: string) => Logger.error(e, 'camera');
const logWarn = (e: string) => Logger.warn(e, 'camera');

const clearCanvas = (
  ref: React.MutableRefObject<HTMLCanvasElement | undefined>,
) => {
  if (!ref.current) {
    logWarn('Canvas could not be cleared. Ref undefined');
    return;
  }

  const context = ref.current.getContext('2d');
  if (!context) {
    logWarn('Canvas could not be cleared. Context undefined');
    return;
  }

  context.clearRect(0, 0, ref.current.width, ref.current.height);
};

const getPositionFromBottom = (kind: DeviceKind): 150 | 50 =>
  kind === 'mobile'
    ? FEEFBACK_POSITION_FROM_BOTTOM_MOBILE
    : FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP;

const getPositionFromTop = (kind: DeviceKind, size?: VideoSize): number =>
  kind === 'mobile'
    ? (size?.height ?? 0) - FEEFBACK_POSITION_FROM_BOTTOM_MOBILE
    : (size?.height ?? 0) - FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP;

const Camera = ({
  autocaptureFeedback,
  autocaptureKind,
  cameraKind,
  children,
  deviceKind,
  docType,
  imageType,
  onCapture,
  onError,
  outlineHeightRatio,
  outlineWidthRatio,
  setIsCaptured,
}: CameraProps) => {
  const { t } = useTranslation('components.camera');
  const canvasAutoCaptureRef = useRef<HTMLCanvasElement>();
  const canvasImageCaptureRef = useRef<HTMLCanvasElement>();
  const videoRef = useRef<HTMLVideoElement>();
  const autocaptureRestartTimeoutRef = useRef<NodeJS.Timeout>();

  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [shouldDetect, setShouldDetect] = useState(false); // auto-detect control

  const videoSize = useSize(videoRef);
  const [
    autoCaptureTimerVal,
    { startCountdown, stopCountdown, resetCountdown },
  ] = useCountdownCustom(CountDownProps);

  const getImageStringFromVideo = useGetImageString();

  const mediaStream = useUserMedia(cameraKind, onError);
  const isCameraVisible = !!mediaStream && isVideoPlaying;
  const { outlineWidth, outlineHeight } = getOutlineDimensions({
    videoSize,
    outlineHeightRatio,
    outlineWidthRatio,
    deviceKind,
  });

  const positionFromTop = getPositionFromTop(deviceKind, videoSize);
  const positionFromBottom = getPositionFromBottom(deviceKind);

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  // We don't detect for 3 seconds so the camera has time to focus
  useTimeout(
    () => {
      setShouldDetect(true);
    },
    isCameraVisible ? AUTOCAPTURE_START_DELAY : null,
  );

  const handleCanPlay = () => {
    if (!videoRef.current) {
      return;
    }
    setIsVideoPlaying(true);
    videoRef.current.play().catch(e => {
      Logger.error(`Error playing video. Error: ${e}`);
    });
  };

  const handleClick = (captureKind: CaptureKind) => {
    if (!canvasImageCaptureRef.current || !videoRef.current) {
      logError(
        `Video ref or canvas not initialized for camera capture for capture kind: ${captureKind}`,
      );
      return;
    }

    const context = canvasImageCaptureRef.current.getContext('2d');
    if (!context) {
      logError(
        `Canvas context is undefined for camera capture for capture kind: ${captureKind}`,
      );
      return;
    }

    if (!videoSize) {
      logError(`Cannot capture - videoSize not initilized: ${captureKind}`);
      return;
    }

    const desiredImageWidth = videoSize.width; // We capture the full width
    let desiredImageHeight = videoSize.height; // We capture the full height for selfie

    // For document capture, we keep the captured width/height spect ratio same as the outline aspect ratio
    // In case maintaining the aspect ratio overflows the height, we take the full height (Math.min)
    if (isDocument(autocaptureKind)) {
      desiredImageHeight = Math.min(
        videoSize.height - positionFromBottom,
        videoSize.width * (outlineHeightRatio / outlineWidthRatio),
      );
    }

    const imageString = getImageStringFromVideo({
      autocaptureKind,
      canvasRef: canvasImageCaptureRef,
      centerOffsetY: isDocument(autocaptureKind) ? -positionFromBottom / 2 : 0,
      context,
      desiredImageHeight,
      desiredImageWidth,
      mediaStream,
      videoRef,
    });

    if (imageString) {
      setIsCaptured(true);
      onCapture(imageString, captureKind);
    }
    clearCanvas(canvasImageCaptureRef);
  };

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
      handleResetDetectionTimer();
      setShouldDetect(false); // We can cancel the countdown
      const restartTimeout = setTimeout(
        () => setShouldDetect(true),
        AUTOCAPTURE_RESTART_DELAY,
      ); // We wait 1s before re-detecting and starting the countdown again
      autocaptureRestartTimeoutRef.current = restartTimeout;
    } else {
      handleClick('manual');
    }
  };

  const handleResetDetectionTimer = () => {
    resetCountdown();
    setIsTimerRunning(false);
  };

  const handleDetectionComplete = () => {
    setIsTimerRunning(true);
    startCountdown();
  };

  useEffect(() => {
    if (autoCaptureTimerVal <= 0) {
      stopCountdown();
      handleClick('auto');
    }
  }, [autoCaptureTimerVal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(autocaptureRestartTimeoutRef.current), []);

  return (
    <>
      {!isCameraVisible ? (
        <LoadingContainer
          data-device-kind={deviceKind}
          desktopHeight={DESKTOP_INTERACTION_BOX_HEIGHT}
        >
          <LoadingIndicator />
        </LoadingContainer>
      ) : null}
      <Container data-visible={isCameraVisible}>
        <VideoContainer data-device-kind={deviceKind}>
          <Video
            autoPlay
            data-camera-kind={cameraKind}
            data-device-kind={deviceKind}
            hidden={!isVideoPlaying}
            muted
            onCanPlay={handleCanPlay}
            playsInline
            ref={videoRef as React.Ref<HTMLVideoElement>}
          />
          {isVideoPlaying && shouldDetect
            ? children({
                canvasAutoCaptureRef,
                feedbackPositionFromBottom: positionFromBottom,
                mediaStream,
                onDetectionComplete: handleDetectionComplete,
                onDetectionReset: handleResetDetectionTimer,
                outlineHeight,
                outlineWidth,
                videoRef,
                videoSize,
              })
            : null}
          {!isImageProcessing ? (
            <>
              <Overlay
                width={videoSize?.width ?? 0}
                height={positionFromTop}
                videoHeight={videoSize?.height ?? 0}
                captureKind={autocaptureKind}
                outlineWidth={outlineWidth}
                outlineHeight={outlineHeight}
                timerAnimationVal={
                  isTimerRunning ? autoCaptureTimerVal : undefined
                }
              />
              <Canvas
                ref={canvasImageCaptureRef as React.Ref<HTMLCanvasElement>}
                width={videoSize?.width}
                height={videoSize?.height}
              />
              <Canvas
                ref={canvasAutoCaptureRef as React.Ref<HTMLCanvasElement>}
                width={videoSize?.width}
                height={videoSize?.height}
              />
              {autocaptureFeedback ? (
                <Feedback deviceKind={deviceKind} top={positionFromTop}>
                  {t(
                    `autocapture.feedback.${autocaptureKind}.${autocaptureFeedback}`,
                    {
                      side: imageType,
                      documentType: docType ? IdDocTypeToLabel[docType] : '',
                    },
                  )}
                </Feedback>
              ) : null}
              {isMobile(deviceKind) && (
                <CaptureButton
                  onClick={onMobileCaptureClick}
                  variant={isTimerRunning ? 'stop' : 'round'}
                  disabled={!isCameraVisible || !videoSize}
                />
              )}
              {isDocument(autocaptureKind) && (
                <UploadButton
                  onUpload={onImageUpload}
                  onComplete={onUploadComplete}
                />
              )}
              {isTimerRunning ? (
                <TimerContainer height={positionFromTop}>
                  <CountdownTimer
                    current={autoCaptureTimerVal}
                    start={AUTOCAPTURE_TIMER_START_VAL}
                  />
                </TimerContainer>
              ) : null}
            </>
          ) : (
            <ProcessingContainer>
              <LoadingIndicator />
            </ProcessingContainer>
          )}
        </VideoContainer>
        {isDesktop(deviceKind) && (
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

export default React.memo(Camera);
