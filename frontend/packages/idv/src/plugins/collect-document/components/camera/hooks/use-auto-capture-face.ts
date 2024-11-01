import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCountdown } from 'usehooks-ts';

import { REQUIRED_SUCCESSES, SELFIE_CHECK_INTERVAL, STATUS_CHANGE_DELAY } from '../../../constants';
import type { CaptureStatus, Resolution, VideoRef } from '../types';
import type { CardCaptureStatus } from '../utils/graphics-utils/graphics-processing-utils';
import useFaceDetection, { FaceStatus } from './use-face-detection';

type AutoCaptureFaceProps = {
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  isCaptured: boolean;
  onDetectionComplete: () => void;
  onDetectionReset: () => void;
  onStatusChange: (currStatus: CaptureStatus | undefined) => void;
  outlineOffsetX?: number;
  outlineOffsetY?: number;
  outlineWidth: number;
  videoRef: VideoRef;
  videoSize: Resolution | undefined;
};

const CountDownProps = {
  countStart: 3, // This is an arbitray value - basically we want a few counts to countdown from and complete the countdown in STATUS_CHANGE_DELAY time
  intervalMs: STATUS_CHANGE_DELAY / 3,
};

const isFaceOk = (x: unknown) => x === FaceStatus.OK;
const isNonZeroVideoSize = (v?: Resolution): v is Resolution => Boolean(v) && v?.width !== 0 && v?.height !== 0;

const useAutoCaptureFace = ({
  canvasRef,
  isCaptured,
  onDetectionComplete,
  onDetectionReset,
  onStatusChange,
  outlineOffsetX,
  outlineOffsetY,
  outlineWidth,
  videoRef,
  videoSize,
}: AutoCaptureFaceProps) => {
  const successCountRef = useRef(0);
  const pastStatusRef = useRef<FaceStatus | CardCaptureStatus | undefined>(FaceStatus.detecting);
  const [statusChangeDelayRunning, setStatusChangeDelayTimeRunning] = useState(false);

  const { getFaceStatus } = useFaceDetection();
  const [waitVal, { startCountdown, resetCountdown }] = useCountdown(CountDownProps);

  const detectAndCaptureFace = useCallback(async (): Promise<void> => {
    if (isCaptured || !videoRef.current || !canvasRef.current || !isNonZeroVideoSize(videoSize)) {
      return;
    }

    const refCanvas = canvasRef.current;
    const context = refCanvas?.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return;
    }

    const faceStatus = await getFaceStatus(videoRef.current, videoSize.width, videoSize.height, {
      width: outlineWidth,
      height: outlineWidth,
      frameOffsetX: outlineOffsetX ?? 0,
      frameOffsetY: outlineOffsetY ?? 0,
    });
    if (isFaceOk(faceStatus)) {
      successCountRef.current += 1;
      onStatusChange(FaceStatus.OK);
      resetCountdown(); // If we had an ok detection within the STATUS_CHANGE_DELAY time
      setStatusChangeDelayTimeRunning(false);
    } else if (!statusChangeDelayRunning) {
      startCountdown(); // We start countdown when we detect a not-ok status
      setStatusChangeDelayTimeRunning(true);
    }
    pastStatusRef.current = faceStatus;
  }, [
    canvasRef,
    getFaceStatus,
    isCaptured,
    onStatusChange,
    outlineOffsetX,
    outlineOffsetY,
    outlineWidth,
    resetCountdown,
    startCountdown,
    statusChangeDelayRunning,
    videoRef,
    videoSize,
  ]);

  // We are taking a timer based approach to change status to not-ok
  // This is because we don't want the alogithm to be too sensitive - we want the algorithm wait a little before changing the status to not-ok
  // We are using STATUS_CHANGE_DELAY as the padding time
  // We start countdown when we detect a not-ok status, and allow the not-ok status take effect after STATUS_CHANGE_DELAY ms if and only if
  // every detection within the delay time was not-ok as well. If we had an ok detection within the STATUS_CHANGE_DELAY time, we reset the timer
  useEffect(() => {
    if (waitVal === 0) {
      if (!isFaceOk(pastStatusRef.current)) {
        onStatusChange(pastStatusRef.current); // We remove the "hold still" message that corresponds to "OK" status only if we get two consecutive non-OK status
        successCountRef.current = 0;
        resetCountdown();
        setStatusChangeDelayTimeRunning(false);
        onDetectionReset();
      }
    }
  }, [waitVal, onStatusChange, resetCountdown, onDetectionReset]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      detectAndCaptureFace();
      if (successCountRef.current >= REQUIRED_SUCCESSES) {
        onDetectionComplete();
      }
      if (isCaptured) clearInterval(intervalId);
    }, SELFIE_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [detectAndCaptureFace, isCaptured, onDetectionComplete]);
};

export default useAutoCaptureFace;
