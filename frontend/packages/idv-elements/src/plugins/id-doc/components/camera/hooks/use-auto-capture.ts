import { useOpenCv } from 'opencv-react-ts';
import type { MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useCountdown } from 'usehooks-ts';

import getSourceDimensions from '../utils/get-source-dimensions';
import {
  CardCaptureStatus,
  getCardCaptureStatus,
} from '../utils/graphics-utils/graphics-processing-utils';
import type { ParamsType } from '../utils/graphics-utils/params';
import { params } from '../utils/graphics-utils/params';
import useFaceDetection, { FaceStatus } from './use-face-detection';
import useSize from './use-size';

// We send a new capture from video every 200 milliseconds for selfie capture
const SELFIE_CHECK_INTERVAL = 200;

// We will check if 2 tries were successful before considering it a complete success
const REQUIRED_SUCCESSES = 2;

// We allow 40 pixels offset outside the card outline (20 pixels each side) along the width
const WIDTH_ERROR_OFFSET = 40;

// We allow 30 pixels offset outside the card outline (10 pixels each side) along the height
const HEIGHT_ERROR_OFFSET = 30;

// We pass through the graphics params set in batches of this size.
// This is to make sure that the autocapture algorithm doesn't block the event queue for too long while passing through all params in one go
const DOC_DETECTION_PARAMS_BATCH_SIZE = 1;

const STATUS_CHANGE_DELAY = 150; // We wait 150 ms before we change the status from ok to not-ok

export type AutocaptureKind = 'document' | 'face';

type AutoCaptureProps = {
  videoRef: MutableRefObject<HTMLVideoElement | undefined>;
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  mediaStream: MediaStream | null;
  outlineWidth: number;
  outlineHeight: number;
  onComplete: () => void;
  shouldDetect: boolean;
  onStatusChange: (currStatus: string | undefined) => void;
  autocaptureKind: AutocaptureKind;
  isCaptured: boolean;
  onReset: () => void;
  outlineOffsetX?: number;
  outlineOffsetY?: number;
};

const useAutoCapture = ({
  videoRef,
  canvasRef,
  mediaStream,
  outlineWidth,
  outlineHeight,
  outlineOffsetX,
  outlineOffsetY,
  onComplete,
  onStatusChange,
  autocaptureKind,
  shouldDetect,
  isCaptured,
  onReset,
}: AutoCaptureProps) => {
  const successCount = useRef(0);
  const rearrangedParams = useRef({ params, currentIndex: 0 });
  const pastStatus = useRef<FaceStatus | CardCaptureStatus | undefined>(
    FaceStatus.detecting,
  );
  const videoSize = useSize(videoRef);
  const { getFaceStatus } = useFaceDetection();
  const { cv, loaded } = useOpenCv();
  const [statusChangeDelayRunning, setStatusChangeDelayTimeRunning] =
    useState(false);
  const [waitVal, { startCountdown, resetCountdown }] = useCountdown({
    countStart: 3, // This is an arbitray value - basically we want a few counts to countdown from and complete the countdown in STATUS_CHANGE_DELAY time
    intervalMs: STATUS_CHANGE_DELAY / 3,
  });

  // We are taking a timer based approach to change status to not-ok
  // This is because we don't want the alogithm to be too sensitive - we want the algorithm wait a little before changing the status to not-ok
  // We are using STATUS_CHANGE_DELAY as the padding time
  // We start countdown when we detect a not-ok status, and allow the not-ok status take effect after STATUS_CHANGE_DELAY ms if and only if
  // every detection within the delay time was not-ok as well. If we had an ok detection within the STATUS_CHANGE_DELAY time, we reset the timer
  useEffect(() => {
    if (waitVal === 0) {
      if (
        (autocaptureKind === 'face' && pastStatus.current !== FaceStatus.OK) ||
        (autocaptureKind === 'document' &&
          pastStatus.current !== CardCaptureStatus.OK)
      ) {
        onStatusChange(pastStatus.current); // We remove the "hold still" message that corresponds to "OK" status only if we get two consecutive non-OK status
        successCount.current = 0;
        resetCountdown();
        setStatusChangeDelayTimeRunning(false);
        onReset();
      }
    }
  });

  useEffect(() => {
    // Bring the selected param to the front
    const rearrangeParams = (
      selectedParamIndex: number,
      oldParams: ParamsType[],
    ) => {
      const newParams = [...oldParams];
      const selectedParam = newParams[selectedParamIndex];
      newParams.splice(selectedParamIndex, 1);
      newParams.unshift(selectedParam);
      return { params: newParams, currentIndex: 0 };
    };

    const detectAndCapture = async () => {
      const context = canvasRef.current?.getContext('2d', {
        willReadFrequently: true,
      });
      if (
        !shouldDetect ||
        isCaptured ||
        !videoRef.current ||
        !canvasRef.current ||
        !videoSize ||
        videoSize.width === 0 ||
        videoSize.height === 0 ||
        !context
      ) {
        return;
      }

      // Width and height of the image that will be used for detection algos
      // We don't want these dimensions to be bigger than video size
      // We add a little bit of cushion space around the frame outline
      const desiredImageWidth = Math.min(
        outlineWidth + WIDTH_ERROR_OFFSET,
        videoSize.width,
      );
      const desiredImageHeight = Math.min(
        outlineHeight + HEIGHT_ERROR_OFFSET,
        videoSize.height + (outlineOffsetY ?? 0) * 2, // This gives us the height above the status feedback where the outline is centered
      );

      if (autocaptureKind === 'document') {
        if (!cv) return;

        // Get the dimensions in video source that corresponds to the frame outline with some cushion
        const sourceDimensions = getSourceDimensions({
          videoRef,
          mediaStream,
          desiredImageWidth,
          desiredImageHeight,
          centerOffsetX: outlineOffsetX,
          centerOffsetY: outlineOffsetY,
        });

        // Lower the size of the canvas so that autocapture algorithm runs faster
        canvasRef.current.setAttribute(
          'width',
          `${Math.floor(sourceDimensions.sWidth / 4)}`,
        );
        canvasRef.current.setAttribute(
          'height',
          `${Math.floor(sourceDimensions.sHeight / 4)}`,
        );

        // We get the static image from the video
        // We only use the area within the frame outline with a little bit of cushion space around the outline
        context.drawImage(
          videoRef.current,
          sourceDimensions.sx,
          sourceDimensions.sy,
          sourceDimensions.sWidth,
          sourceDimensions.sHeight,
          0,
          0,
          canvasRef.current?.clientWidth,
          canvasRef.current?.clientHeight,
        );

        // We get the card capture status and the index of the param that successfully detected the card
        const { status: cardCaptureStatus, paramIndex } = getCardCaptureStatus(
          canvasRef.current,
          rearrangedParams.current.params,
          cv,
          loaded,
          rearrangedParams.current.currentIndex,
          DOC_DETECTION_PARAMS_BATCH_SIZE,
        );

        if (cardCaptureStatus === CardCaptureStatus.OK) {
          rearrangedParams.current = rearrangeParams(
            paramIndex,
            rearrangedParams.current.params,
          );
        } else {
          const currIndex = rearrangedParams.current.currentIndex;
          const totalParams = rearrangedParams.current.params.length;
          let newIndex = currIndex + DOC_DETECTION_PARAMS_BATCH_SIZE;
          if (newIndex >= totalParams) newIndex = 0;
          rearrangedParams.current.currentIndex = newIndex;
        }
        // if (rearrangedParams.current.currentIndex === 0) {
        // We only update the past status if it did one complete pass through the params or succeeded in detection
        if (cardCaptureStatus === CardCaptureStatus.OK) {
          successCount.current += 1;
          onStatusChange(CardCaptureStatus.OK);
          resetCountdown(); // If we had an ok detection within the STATUS_CHANGE_DELAY time
          setStatusChangeDelayTimeRunning(false);
        } else if (!statusChangeDelayRunning) {
          startCountdown(); // We start countdown when we detect a not-ok status
          setStatusChangeDelayTimeRunning(true);
        }
        pastStatus.current = cardCaptureStatus;
      } else if (autocaptureKind === 'face') {
        const faceStatus = await getFaceStatus(
          videoRef.current,
          videoSize.width,
          videoSize.height,
          {
            width: outlineWidth,
            height: outlineWidth,
            frameOffsetX: outlineOffsetX ?? 0,
            frameOffsetY: outlineOffsetY ?? 0,
          },
        );
        if (faceStatus === FaceStatus.OK) {
          successCount.current += 1;
          onStatusChange(FaceStatus.OK);
          resetCountdown(); // If we had an ok detection within the STATUS_CHANGE_DELAY time
          setStatusChangeDelayTimeRunning(false);
        } else if (!statusChangeDelayRunning) {
          startCountdown(); // We start countdown when we detect a not-ok status
          setStatusChangeDelayTimeRunning(true);
        }
        pastStatus.current = faceStatus;
      }
    };

    const id = setInterval(
      async () => {
        if (shouldDetect) {
          detectAndCapture();
          if (successCount.current >= REQUIRED_SUCCESSES) {
            onComplete();
          }
        }
        if (isCaptured) clearInterval(id);
      },
      autocaptureKind === 'face' ? SELFIE_CHECK_INTERVAL : undefined, // Since we are checking params in small batches, we don't want to delay more than what it requires to performs the detection. So, we use undefined delay for doc capture
    );
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autocaptureKind,
    canvasRef,
    cv,
    getFaceStatus,
    isCaptured,
    loaded,
    mediaStream,
    onComplete,
    onReset,
    onStatusChange,
    outlineHeight,
    outlineWidth,
    shouldDetect,
    statusChangeDelayRunning,
    videoRef,
    videoSize,
  ]);
};

export default useAutoCapture;
