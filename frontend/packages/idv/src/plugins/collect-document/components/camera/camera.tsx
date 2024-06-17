import { useCountdownCustom, useInterval } from '@onefootprint/hooks';
import { AnimatedLoadingSpinner, Stack, Text, media } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import noop from 'lodash/noop';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useTimeout } from 'usehooks-ts';

import { getLogger } from '../../../../utils/logger';
import DESKTOP_INTERACTION_BOX_HEIGHT from '../../constants/desktop-interaction-box.constants';
import {
  AUTOCAPTURE_RESTART_DELAY,
  AUTOCAPTURE_START_DELAY,
  AUTOCAPTURE_TIMER_INTERVAL,
} from '../../constants/transition-delay.constants';
import type { CaptureKind } from '../../types';
import {
  VideoEvents,
  clearCanvas,
  getHtmlVideoElement,
  isDesktop,
  isDocument,
  isFunction,
  isMobile,
  isNonPlayingVideoEvent,
  isNotAllowedError,
} from '../../utils/capture';
import CaptureButton from './components/capture-button';
import CountdownTimer from './components/countdown-timer';
import Feedback from './components/feedback';
import Overlay from './components/overlay';
import PlayPermissionDialog from './components/play-permission-dialog';
import UploadButton from './components/upload-button';
import useGetImageString from './hooks/use-get-image-string';
import useSize from './hooks/use-size';
import useUserMedia from './hooks/use-user-media';
import type { AutocaptureKind, CaptureStatus, DeviceKind, VideoRef, VideoSize } from './types';
import type { CameraKind } from './utils/get-camera-options';
import getOutlineDimensions from './utils/get-outline-dimensions';

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
  switchCamera: () => void;
};

type CameraProps = {
  autocaptureFeedback?: CaptureStatus;
  autocaptureKind: AutocaptureKind;
  cameraKind: CameraKind;
  children: (props: ChildrenProps) => JSX.Element | null;
  deviceKind: DeviceKind;
  docName?: string;
  sideName?: string;
  onCapture: (image: string, captureKind: CaptureKind) => void;
  onUpload: (imageFile: File | Blob, extraCompressed: boolean, captureKind: CaptureKind) => void;
  hasBadConnectivity?: boolean;
  onError?: () => void;
  outlineHeightRatio: number; // with respect to the video width (not height since width is smaller)
  outlineWidthRatio: number; // with respect to the video width
  setIsCaptured: React.Dispatch<React.SetStateAction<boolean>>;
  allowPdf: boolean;
  onCameraStuck: () => void;
  allowUpload: boolean;
};

const AUTOCAPTURE_TIMER_START_VAL = 3;
const FEEFBACK_POSITION_FROM_BOTTOM_MOBILE = 150;
const FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP = 50;
const CountDownProps = {
  countStart: AUTOCAPTURE_TIMER_START_VAL,
  intervalMs: AUTOCAPTURE_TIMER_INTERVAL,
};
const PLAY_CHECK_INTERVAL = 1500;
const FORCED_UPLOAD_DELAY = 7000;
const CAMERA_LOADING_FEEDBACK_DELAY = 4000;

const { logError, logInfo, logTrack, logWarn } = getLogger({
  location: 'camera',
});

const videoElementStateListener =
  (
    setPlayingState: (state: boolean) => void,
    _isPlaying: boolean,
    onPlayNotAllowed: () => void,
    videoElement: HTMLVideoElement,
  ) =>
  (event: Event) => {
    if (!videoElement) return;
    logTrack(`Video event: ${event.type}`);
    if (isFunction(videoElement?.play) && isNonPlayingVideoEvent(event) && videoElement.readyState >= 2) {
      setPlayingState(false);
      videoElement
        .play()
        .then(() => {
          logTrack('Video event: playing');
          setPlayingState(true);
        })
        .catch(err => {
          if (isNotAllowedError(err.name)) {
            onPlayNotAllowed();
            logWarn('Video play event: not allowed - prompting user interaction', err);
          } else {
            logError(`Video play event: error`, err);
          }
        });
    }
  };

const getPositionFromBottom = (kind: DeviceKind): 150 | 50 =>
  kind === 'mobile' ? FEEFBACK_POSITION_FROM_BOTTOM_MOBILE : FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP;

const getPositionFromTop = (kind: DeviceKind, size?: VideoSize): number =>
  kind === 'mobile'
    ? (size?.height ?? 0) - FEEFBACK_POSITION_FROM_BOTTOM_MOBILE
    : (size?.height ?? 0) - FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP;

const getDesiredSize = (
  videoSize: VideoSize,
  autocaptureKind: AutocaptureKind,
  positionFromBottom: number,
  outlineHeightRatio: number,
  outlineWidthRatio: number,
) => {
  // For document capture, we keep the captured width/height spect ratio same as the outline aspect ratio
  // In case maintaining the aspect ratio overflows the height, we take the full height (Math.min)
  if (isDocument(autocaptureKind)) {
    return {
      width: videoSize.width,
      height: Math.min(
        videoSize.height - positionFromBottom,
        videoSize.width * (outlineHeightRatio / outlineWidthRatio),
      ),
    };
  }

  return videoSize; // We capture the full height for selfie
};

const Camera = ({
  autocaptureFeedback,
  autocaptureKind,
  cameraKind,
  children,
  deviceKind,
  docName,
  sideName,
  onCapture,
  onUpload,
  onError,
  outlineHeightRatio,
  outlineWidthRatio,
  setIsCaptured,
  allowPdf,
  onCameraStuck,
  allowUpload,
  hasBadConnectivity,
}: CameraProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.camera',
  });
  const canvasAutoCaptureRef = useRef<HTMLCanvasElement>();
  const canvasImageCaptureRef = useRef<HTMLCanvasElement>();
  const videoRef: VideoRef = useRef<HTMLVideoElement>(null);
  const autocaptureRestartTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [shouldDetect, setShouldDetect] = useState(false); // auto-detect control
  const [showPlayAllowDialog, setShowPlayAllowDialog] = useState(false);
  const [onCanPlayTriggered, setOnCanPlayTriggered] = useState(false);
  const [showCameraLoadingFeedback, setShowCameraLoadingFeedback] = useState(false);

  const videoSize = useSize(videoRef);
  const [autoCaptureTimerVal, { startCountdown, stopCountdown, resetCountdown }] = useCountdownCustom(CountDownProps);

  const getImageStringFromVideo = useGetImageString();

  const { mediaStream, switchCamera } = useUserMedia(cameraKind, onError);
  const isCameraVisible = Boolean(mediaStream?.active) && isVideoPlaying;
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

  const handlePlayError = (err: unknown) => {
    if (err instanceof Error && isNotAllowedError(err?.name)) {
      if (!showPlayAllowDialog) setShowPlayAllowDialog(true);
      logWarn('video play: not allowed - prompting user interaction', err);
    } else {
      logError(`video play: error`, err);
    }
  };

  const handleCanPlay = () => {
    setOnCanPlayTriggered(true);
    logTrack('(onCanPlay) video triggered ');
    if (isVideoPlaying) {
      logTrack('(onCanPlay) video already playing');
      return;
    }
    if (!videoRef.current) {
      logWarn('(onCanPlay) video ref not initialized');
      return;
    }
    if (videoRef.current.readyState < 2) {
      logWarn('(onCanPlay) video not ready to play');
      return;
    }
    videoRef.current
      .play()
      .then(() => {
        logTrack('(onCanPlay) video element status: playing');
        setIsVideoPlaying(true);
      })
      .catch(handlePlayError);
  };

  useInterval(
    () => {
      logInfo(
        `(interval) mediaStream state: ${
          mediaStream ? 1 : 0
        }, mediaStream active: ${mediaStream?.active ? 1 : 0}, onCanPlayTriggered: ${onCanPlayTriggered ? 1 : 0}, isVideoPlaying: ${isVideoPlaying ? 1 : 0}`,
      );
      if (isVideoPlaying) {
        logInfo('(interval) video already playing');
        return;
      }
      if (!videoRef.current) {
        logError('(interval) video ref not initialized');
        return;
      }
      if (videoRef.current.readyState < 2) {
        logWarn(
          `(interval) video not ready to play. readyState: ${videoRef.current.readyState}, has videoRef src: ${!!videoRef.current.src}`,
        );
        return;
      }
      videoRef.current
        .play()
        .then(() => {
          logWarn('(interval) video element status: started playing');
          setIsVideoPlaying(true);
        })
        .catch(handlePlayError);
    },
    isVideoPlaying ? null : PLAY_CHECK_INTERVAL,
  );

  useTimeout(() => {
    if (!isCameraVisible) {
      logWarn('camera not visible after timeout');
      onCameraStuck();
    }
  }, FORCED_UPLOAD_DELAY);

  useTimeout(() => {
    setShowCameraLoadingFeedback(true);
  }, CAMERA_LOADING_FEEDBACK_DELAY);

  const handlePlayAllow = () => {
    setShowPlayAllowDialog(false);
    handleCanPlay();
  };

  const handleClick = (captureKind: CaptureKind) => {
    logTrack(`(handleClick) ${captureKind} clicked`);
    if (!canvasImageCaptureRef.current || !videoRef.current) {
      logError(`Video ref or canvas not initialized for camera capture for capture kind: ${captureKind}`);
      return;
    }

    const context = canvasImageCaptureRef.current.getContext('2d');
    if (!context) {
      logError(`Canvas context is undefined for camera capture for capture kind: ${captureKind}`);
      return;
    }

    if (!videoSize) {
      logError(`Cannot capture - videoSize not initialized: ${captureKind}`);
      return;
    }

    const desiredSize = getDesiredSize(
      videoSize,
      autocaptureKind,
      positionFromBottom,
      outlineHeightRatio,
      outlineWidthRatio,
    );

    const imageString = getImageStringFromVideo({
      autocaptureKind,
      canvasRef: canvasImageCaptureRef,
      centerOffsetY: isDocument(autocaptureKind) ? -positionFromBottom / 2 : 0,
      context,
      desiredImageHeight: desiredSize.height,
      desiredImageWidth: desiredSize.width,
      mediaStream,
      videoRef,
    });

    if (imageString) {
      setIsCaptured(true);
      onCapture(imageString, captureKind);
    }
    clearCanvas(logWarn, canvasImageCaptureRef);
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
      const restartTimeout = setTimeout(() => setShouldDetect(true), AUTOCAPTURE_RESTART_DELAY); // We wait 1s before re-detecting and starting the countdown again
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

  // We don't detect for 3 seconds so the camera has time to focus
  useTimeout(() => setShouldDetect(true), isCameraVisible ? AUTOCAPTURE_START_DELAY : null);

  useEffect(() => {
    if (autoCaptureTimerVal <= 0) {
      stopCountdown();
      handleClick('auto');
    }
  }, [autoCaptureTimerVal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const vidRef = getHtmlVideoElement(videoRef);
    if (!vidRef || !isVideoPlaying) return noop;

    const listener = videoElementStateListener(
      setIsVideoPlaying,
      isVideoPlaying,
      () => setShowPlayAllowDialog(true),
      vidRef,
    );
    VideoEvents.forEach(e => vidRef.addEventListener(e, listener));

    return () => {
      VideoEvents.forEach(e => vidRef.removeEventListener(e, listener));
    };
  }, [isVideoPlaying, videoRef]);

  useEffect(() => () => clearTimeout(autocaptureRestartTimeoutRef.current), []);
  const feedbackText = t(
    `autocapture.feedback.${autocaptureKind}.${autocaptureFeedback}` as unknown as TemplateStringsArray,
    {
      side: sideName ?? '',
      documentType: docName ?? '',
    },
  ) as unknown as string;

  return (
    <>
      {!isCameraVisible ? (
        <LoadingContainer data-device-kind={deviceKind} desktopHeight={DESKTOP_INTERACTION_BOX_HEIGHT}>
          <AnimatePresence>
            <AnimatedLoadingSpinner animationStart />
            {showCameraLoadingFeedback && (
              <TextContainer
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                initial={{ opacity: 0, y: 10 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Text variant="label-1">{t('loading.title')}</Text>
                <Text variant="body-2" color="secondary">
                  {t('loading.subtitle')}
                </Text>
              </TextContainer>
            )}
          </AnimatePresence>
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
            ref={videoRef}
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
                switchCamera,
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
                timerAnimationVal={isTimerRunning ? autoCaptureTimerVal : undefined}
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
                  {feedbackText}
                </Feedback>
              ) : null}
              {isMobile(deviceKind) && (
                <CaptureButton
                  onClick={onMobileCaptureClick}
                  variant={isTimerRunning ? 'stop' : 'round'}
                  disabled={!isCameraVisible || !videoSize}
                />
              )}
              {isDocument(autocaptureKind) && allowUpload && (
                <UploadButton
                  onUploadBtnClick={onImageUpload}
                  onUploadChangeDone={onUploadComplete}
                  allowPdf={allowPdf}
                  onUploadSuccess={onUpload}
                  hasBadConnectivity={hasBadConnectivity}
                />
              )}
              {isTimerRunning ? (
                <TimerContainer height={positionFromTop}>
                  <CountdownTimer current={autoCaptureTimerVal} start={AUTOCAPTURE_TIMER_START_VAL} />
                </TimerContainer>
              ) : null}
            </>
          ) : (
            <ProcessingContainer>
              <AnimatedLoadingSpinner animationStart />
            </ProcessingContainer>
          )}
        </VideoContainer>
        {isDesktop(deviceKind) && (
          <CaptureButton
            onClick={() => handleClick('manual')}
            disabled={!isCameraVisible || !videoSize}
            variant="default"
          />
        )}
        <PlayPermissionDialog
          open={showPlayAllowDialog}
          hide={() => setShowPlayAllowDialog(false)}
          onAllow={handlePlayAllow}
        />
      </Container>
    </>
  );
};

const TextContainer = styled(motion(Stack))`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[3]};
    height: fit-content;
  `}
`;

const LoadingContainer = styled.div<{
  desktopHeight: number;
}>`
  ${({ theme, desktopHeight }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex: 1;
    width: 100%;
    gap: ${theme.spacing[7]};

    &[data-device-kind='mobile'] {
      position: absolute;
      top: calc(50% - ${theme.spacing[5]});
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &[data-device-kind='desktop'] {
      position: relative;
      min-height: ${desktopHeight}px;
      background-color: ${theme.backgroundColor.secondary};
      border-radius: ${theme.borderRadius.default};

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
