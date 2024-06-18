import { useCountdownCustom } from '@onefootprint/hooks';
import { useOpenCv } from 'opencv-react-ts';
import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CaptureStatus, DocSrcDimensions, VideoRef, VideoSize } from '../types';
import computeSrcDimensions, { docDrawer } from '../utils/auto-capture';
import { CardCaptureStatus, getCardCaptureStatus } from '../utils/graphics-utils/graphics-processing-utils';
import type { ParamsType } from '../utils/graphics-utils/params';
import { params } from '../utils/graphics-utils/params';
import { FaceStatus } from './use-face-detection';

type AutoCaptureProps = {
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  isCaptured: boolean;
  mediaStream: MediaStream | null;
  onDetectionComplete: () => void;
  onDetectionReset: () => void;
  onStatusChange: (currStatus: CaptureStatus | undefined) => void;
  outlineHeight: number;
  outlineOffsetX?: number;
  outlineOffsetY?: number;
  outlineWidth: number;
  videoRef: VideoRef;
  videoSize: VideoSize | undefined;
};

// const SELFIE_CHECK_INTERVAL = 200; // We send a new capture from video every 200 milliseconds for selfie capture
const REQUIRED_SUCCESSES = 2; // We will check if 2 tries were successful before considering it a complete success
const STATUS_CHANGE_DELAY = 150; // We wait 150 ms before we change the status from ok to not-ok

// We pass through the graphics params set in batches of this size.
// This is to make sure that the autocapture algorithm doesn't block the event queue for too long while passing through all params in one go
const DOC_DETECTION_PARAMS_BATCH_SIZE = 1;

const CountDownProps = {
  countStart: 3, // This is an arbitray value - basically we want a few counts to countdown from and complete the countdown in STATUS_CHANGE_DELAY time
  intervalMs: STATUS_CHANGE_DELAY / 3,
};

const isCardOk = (x: unknown) => x === CardCaptureStatus.OK;
const isNonZeroVideoSize = (v?: VideoSize): v is VideoSize => Boolean(v) && v?.width !== 0 && v?.height !== 0;

// Bring the selected param to the front
const moveParamToStart = (selectedParamIndex: number, oldParams: ParamsType[]) => {
  const [selectedParam] = oldParams.splice(selectedParamIndex, 1);
  return { params: [selectedParam, ...oldParams], currentIndex: 0 };
};

const getNextIndexForBatch = (
  rearrangedParamsRef: MutableRefObject<{
    params: ParamsType[];
    currentIndex: number;
  }>,
) => {
  const currIndex = rearrangedParamsRef.current.currentIndex;
  const totalParams = rearrangedParamsRef.current.params.length;
  let newIndex = currIndex + DOC_DETECTION_PARAMS_BATCH_SIZE;
  if (newIndex >= totalParams) newIndex = 0;
  return newIndex;
};

const useAutoCaptureDoc = ({
  canvasRef,
  isCaptured,
  mediaStream,
  onDetectionComplete,
  onDetectionReset,
  onStatusChange,
  outlineHeight,
  outlineOffsetX,
  outlineOffsetY,
  outlineWidth,
  videoRef,
  videoSize,
}: AutoCaptureProps) => {
  const successCountRef = useRef(0);
  const rearrangedParamsRef = useRef({ params, currentIndex: 0 });
  const pastStatusRef = useRef<FaceStatus | CardCaptureStatus | undefined>(FaceStatus.detecting);
  const [statusChangeDelayRunning, setStatusChangeDelayTimeRunning] = useState(false);

  const { cv, loaded } = useOpenCv();
  const [waitVal, { startCountdown, resetCountdown }] = useCountdownCustom(CountDownProps);

  /**
   * Width and height of the image that will be used for detection algos
   * We don't want these dimensions to be bigger than video size
   * We add a little bit of cushion space around the frame outline
   */
  const memoDocSrcDimensions: DocSrcDimensions | undefined = useMemo(
    () =>
      isNonZeroVideoSize(videoSize)
        ? computeSrcDimensions(
            videoSize,
            outlineWidth,
            outlineHeight,
            outlineOffsetY,
            videoRef,
            mediaStream,
            outlineOffsetX,
          )
        : undefined,
    [videoSize, outlineWidth, outlineHeight, outlineOffsetY, videoRef, mediaStream, outlineOffsetX],
  );

  const docImageDrawer = useCallback(
    (vidRef: VideoRef) =>
      !memoDocSrcDimensions || !canvasRef.current || !vidRef.current
        ? undefined
        : docDrawer(memoDocSrcDimensions, canvasRef, vidRef),
    [canvasRef, memoDocSrcDimensions],
  );

  const detectAndCaptureDocument = useCallback((): void => {
    if (isCaptured || !cv || !videoRef.current || !isNonZeroVideoSize(videoSize) || !docImageDrawer) {
      return;
    }

    const refCanvas = docImageDrawer(videoRef);
    if (!refCanvas) return;

    // We get the card capture status and the index of the param that successfully detected the card
    const { status: cardCaptureStatus, paramIndex } = getCardCaptureStatus(
      refCanvas,
      rearrangedParamsRef.current.params,
      cv,
      loaded,
      rearrangedParamsRef.current.currentIndex,
      DOC_DETECTION_PARAMS_BATCH_SIZE,
    );

    if (isCardOk(cardCaptureStatus)) {
      rearrangedParamsRef.current = moveParamToStart(paramIndex, rearrangedParamsRef.current.params);
    } else {
      rearrangedParamsRef.current.currentIndex = getNextIndexForBatch(rearrangedParamsRef);
    }

    // if (rearrangedParams.current.currentIndex === 0) {
    // We only update the past status if it did one complete pass through the params or succeeded in detection
    if (isCardOk(cardCaptureStatus)) {
      successCountRef.current += 1;
      onStatusChange(CardCaptureStatus.OK);
      resetCountdown(); // If we had an ok detection within the STATUS_CHANGE_DELAY time
      setStatusChangeDelayTimeRunning(false);
    } else if (!statusChangeDelayRunning) {
      startCountdown(); // We start countdown when we detect a not-ok status
      setStatusChangeDelayTimeRunning(true);
    }
    pastStatusRef.current = cardCaptureStatus;
  }, [
    cv,
    docImageDrawer,
    isCaptured,
    loaded,
    onStatusChange,
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
      if (!isCardOk(pastStatusRef.current)) {
        onStatusChange(pastStatusRef.current); // We remove the "hold still" message that corresponds to "OK" status only if we get two consecutive non-OK status
        successCountRef.current = 0;
        resetCountdown();
        setStatusChangeDelayTimeRunning(false);
        onDetectionReset();
      }
    }
  }, [waitVal, onStatusChange, resetCountdown, onDetectionReset]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      detectAndCaptureDocument();
      if (successCountRef.current >= REQUIRED_SUCCESSES) {
        onDetectionComplete();
      }

      if (isCaptured) cancelAnimationFrame(frameId);
    });

    return () => cancelAnimationFrame(frameId);
  }, [detectAndCaptureDocument, isCaptured, onDetectionComplete]);
};

export default useAutoCaptureDoc;
