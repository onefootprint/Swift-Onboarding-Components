import { LoadingSpinner, Stack, Text, media } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import noop from 'lodash/noop';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useCountdown, useEffectOnce, useInterval, useTimeout } from 'usehooks-ts';

import { getLogger, trackAction } from '../../../../utils/logger';
import { DESKTOP_INTERACTION_BOX_HEIGHT } from '../../constants';
import {
  AUTOCAPTURE_RESTART_DELAY,
  AUTOCAPTURE_START_DELAY,
  AUTOCAPTURE_TIMER_INTERVAL,
  AUTOCAPTURE_TIMER_START_VAL,
  CAMERA_LOADING_FEEDBACK_DELAY,
  FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP,
  FEEFBACK_POSITION_FROM_BOTTOM_MOBILE,
  FORCED_UPLOAD_DELAY,
  PLAY_CHECK_INTERVAL,
} from '../../constants';
import type { CaptureKind, ReceivedImagePayload } from '../../types';
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
import { getMediaStream } from './hooks/use-user-media';
import type { AutoCaptureKind, CaptureStatus, DeviceKind, Resolution, VideoRef } from './types';
import type { CameraSide } from './utils/get-camera-options';
import getCameraOptions from './utils/get-camera-options';
import getOutlineDimensions from './utils/get-outline-dimensions';

type ChildrenProps = {
  canvasAutoCaptureRef: React.MutableRefObject<HTMLCanvasElement | undefined>;
  feedbackPositionFromBottom: number;
  videoResolution?: Resolution;
  onDetectionComplete: () => void;
  onDetectionReset: () => void;
  outlineHeight: number;
  outlineWidth: number;
  videoRef: VideoRef;
  videoSize: Resolution | undefined;
};

type CameraProps = {
  autoCaptureFeedback?: CaptureStatus;
  autoCaptureKind: AutoCaptureKind;
  cameraSide: CameraSide;
  children: (props: ChildrenProps) => JSX.Element | null;
  deviceKind: DeviceKind;
  docName?: string;
  sideName?: string;
  onCapture: (image: string, captureKind: CaptureKind) => void;
  onUpload: (payload: ReceivedImagePayload) => void;
  hasBadConnectivity?: boolean;
  onError?: (err?: unknown) => void;
  outlineHeightRatio: number; // with respect to the video width (not height since width is smaller)
  outlineWidthRatio: number; // with respect to the video width
  setIsCaptured: React.Dispatch<React.SetStateAction<boolean>>;
  allowPdf: boolean;
  onCameraStuck: () => void;
  allowUpload: boolean;
};

const CountDownProps = {
  countStart: AUTOCAPTURE_TIMER_START_VAL,
  intervalMs: AUTOCAPTURE_TIMER_INTERVAL,
};

const { logError, logInfo, logTrack, logWarn } = getLogger({ location: 'camera' });

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
            logError('Video play event: error', err);
          }
        });
    }
  };

const getPositionFromBottom = (kind: DeviceKind): 150 | 50 =>
  kind === 'mobile' ? FEEFBACK_POSITION_FROM_BOTTOM_MOBILE : FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP;

const getPositionFromTop = (kind: DeviceKind, size?: Resolution): number =>
  kind === 'mobile'
    ? (size?.height ?? 0) - FEEFBACK_POSITION_FROM_BOTTOM_MOBILE
    : (size?.height ?? 0) - FEEDBACK_POSITION_FROM_BOTTOM_DESKTOP;

const getDesiredSize = (
  videoSize: Resolution,
  autoCaptureKind: AutoCaptureKind,
  positionFromBottom: number,
  outlineHeightRatio: number,
  outlineWidthRatio: number,
) => {
  // For document capture, we keep the captured width/height spect ratio same as the outline aspect ratio
  // In case maintaining the aspect ratio overflows the height, we take the full height (Math.min)
  if (isDocument(autoCaptureKind)) {
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

const getVideoTrackSettings = (stream?: MediaStream | null): MediaTrackSettings | undefined => {
  if (!stream) return undefined;

  const videoTracks = stream.getVideoTracks();
  if (videoTracks.length === 0) {
    return undefined;
  }

  const videoTrack = videoTracks[0];
  if (!videoTrack) {
    return undefined;
  }

  return videoTrack.getSettings();
};

const getVideoResolution = (stream?: MediaStream | null): Resolution | undefined => {
  const settings = getVideoTrackSettings(stream);
  return settings?.width && settings.height ? { width: settings.width, height: settings.height } : undefined;
};

const Camera = ({
  autoCaptureFeedback,
  autoCaptureKind,
  cameraSide,
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
  const { t } = useTranslation('idv', { keyPrefix: 'document-flow.components.camera' });
  const canvasAutoCaptureRef = useRef<HTMLCanvasElement>();
  const canvasImageCaptureRef = useRef<HTMLCanvasElement>();
  const videoRef: VideoRef = useRef<HTMLVideoElement>(null);
  const autocaptureRestartTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showPlayAllowDialog, setShowPlayAllowDialog] = useState(false);
  const [onCanPlayTriggered, setOnCanPlayTriggered] = useState(false);
  const [showCameraLoadingFeedback, setShowCameraLoadingFeedback] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffectOnce(() => {
    trackAction('camera-page:started');
  });

  useEffect(() => {
    if (isVideoPlaying) {
      trackAction('camera-page:video-playing');
    }
  }, [isVideoPlaying]);

  const videoSize = useSize(videoRef);
  const [autoCaptureTimerVal, { startCountdown, stopCountdown, resetCountdown }] = useCountdown(CountDownProps);

  const getImageStringFromVideo = useGetImageString();

  useEffect(() => {
    if (!mediaStream) {
      const cameraOptions = getCameraOptions(cameraSide);
      getMediaStream(cameraOptions)
        .then(stream => {
          setMediaStream(stream);
        })
        .catch(err => {
          logError('(camera useEffect) Error getting media stream', err);
          onError?.(err);
        });
    }

    return () => {
      if (mediaStream) {
        logInfo("Camera unmounting - stopping media stream's tracks");
        mediaStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, [mediaStream]);

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
    logInfo('Setting video src object');
    videoRef.current.srcObject = mediaStream;
  } else {
    logTrack(
      `Could not set video src object. MediaStream ${mediaStream}, videoRef ${videoRef.current}, has srcObject ${!!videoRef?.current?.srcObject}`,
    );
  }

  const handlePlayError = (err: unknown) => {
    if (err instanceof Error && isNotAllowedError(err?.name)) {
      if (!showPlayAllowDialog) setShowPlayAllowDialog(true);
      logWarn('video play: not allowed - prompting user interaction', err);
    } else {
      logError('video play: error', err);
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

  const logMediaStreamState = () => {
    logInfo(`mediaStream state: ${mediaStream ? 1 : 0}, mediaStream active: ${mediaStream?.active ? 1 : 0}`);
    mediaStream?.getTracks().forEach(track => {
      logInfo(`Track: ${track.id}, readyState: ${track.readyState}, kind: ${track.kind}, label: ${track.label}`);
    });
  };

  const handleWaiting = () => {
    logWarn('video waiting');
    // Log the media stream state
    logMediaStreamState();

    // Force load
    // TODO: if this doesn't work, we will re-create the media stream - try a simple reload first
    videoRef.current?.load();
    if (isVideoPlaying) {
      setIsVideoPlaying(false);
    }
  };

  const handleSuspension = () => {
    logWarn('video suspended');
    // Log the media stream state
    logMediaStreamState();
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
      if (!videoRef.current.srcObject) {
        logWarn('(interval) video src object not set');
        if (mediaStream?.active) {
          logInfo('(interval) setting video src object');
          videoRef.current.srcObject = mediaStream;
        }
        return;
      }
      if (videoRef.current.readyState < 2) {
        logWarn(`(interval) video not ready to play. Readystate: ${videoRef.current.readyState}`);
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
      autoCaptureKind,
      positionFromBottom,
      outlineHeightRatio,
      outlineWidthRatio,
    );

    const imageString = getImageStringFromVideo({
      autoCaptureKind,
      canvasRef: canvasImageCaptureRef,
      centerOffsetY: isDocument(autoCaptureKind) ? -positionFromBottom / 2 : 0,
      context,
      desiredImageHeight: desiredSize.height,
      desiredImageWidth: desiredSize.width,
      videoResolution: getVideoResolution(mediaStream),
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
    setIsDetecting(false);
  };

  const onUploadComplete = () => {
    setIsImageProcessing(false);
    setIsDetecting(true);
  };

  const onMobileCaptureClick = () => {
    if (isTimerRunning) {
      handleResetDetectionTimer();
      setIsDetecting(false); // We can cancel the countdown
      const restartTimeout = setTimeout(() => setIsDetecting(true), AUTOCAPTURE_RESTART_DELAY); // We wait 1s before re-detecting and starting the countdown again
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
  useTimeout(() => setIsDetecting(true), isCameraVisible ? AUTOCAPTURE_START_DELAY : null);

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
    `autocapture.feedback.${autoCaptureKind}.${autoCaptureFeedback}` as unknown as TemplateStringsArray,
    {
      side: sideName ?? '',
      documentType: docName ?? '',
    },
  ) as unknown as string;

  return (
    <>
      <Container>
        <VideoContainer data-device-kind={deviceKind}>
          <Video
            autoPlay
            data-camera-kind={cameraSide}
            data-device-kind={deviceKind}
            hidden={!isVideoPlaying}
            muted
            onCanPlay={handleCanPlay}
            playsInline
            ref={videoRef}
            onSuspend={handleSuspension}
            onWaiting={handleWaiting}
          />
          {isVideoPlaying && isDetecting
            ? children({
                canvasAutoCaptureRef,
                feedbackPositionFromBottom: positionFromBottom,
                videoResolution: getVideoResolution(mediaStream),
                onDetectionComplete: handleDetectionComplete,
                onDetectionReset: handleResetDetectionTimer,
                outlineHeight,
                outlineWidth,
                videoRef,
                videoSize,
              })
            : null}
          {isCameraVisible && (
            <>
              {!isImageProcessing ? (
                <>
                  <Overlay
                    width={videoSize?.width ?? 0}
                    height={positionFromTop}
                    videoHeight={videoSize?.height ?? 0}
                    captureKind={autoCaptureKind}
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
                  {autoCaptureFeedback ? (
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
                  {isDocument(autoCaptureKind) && allowUpload && (
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
                  <LoadingSpinner />
                </ProcessingContainer>
              )}
            </>
          )}
        </VideoContainer>
        {isDesktop(deviceKind) && isCameraVisible && (
          <CaptureButton
            onClick={() => handleClick('manual')}
            disabled={!isCameraVisible || !videoSize}
            variant="default"
          />
        )}
        {isCameraVisible && (
          <PlayPermissionDialog
            open={showPlayAllowDialog}
            hide={() => setShowPlayAllowDialog(false)}
            onAllow={handlePlayAllow}
          />
        )}
      </Container>
      {!isCameraVisible && (
        <LoadingContainer data-device-kind={deviceKind} $desktopHeight={DESKTOP_INTERACTION_BOX_HEIGHT}>
          <AnimatePresence>
            <LoadingSpinner />
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
      )}
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

const LoadingContainer = styled.div<{ $desktopHeight: number }>`
  ${({ theme, $desktopHeight }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 100%;
    gap: ${theme.spacing[7]};

    &[data-device-kind='mobile'] {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: ${theme.backgroundColor.primary};
    }

    &[data-device-kind='desktop'] {
      position: relative;
      min-height: ${$desktopHeight}px;
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
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    row-gap: ${theme.spacing[7]};
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

      ${media.greaterThan('md')`
        justify-content: end;
        height: 530px; // Set the minimum height for the selfie step when using a "tablet" in horizontal orientation
      `}
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
