import { useOpenCv } from 'opencv-react-ts';
import type { MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTimeout } from 'usehooks-ts';

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

// In some cases iOS captures too quick before focusing and captures a blurry image
// This delay will make sure that there is some time to focus before autocapture
const AUTOCAPTURE_DELAY = 3000;

export type AutocaptureKind = 'document' | 'face';

type AutoCaptureProps = {
  videoRef: MutableRefObject<HTMLVideoElement | undefined>;
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  mediaStream: MediaStream | null;
  outlineWidth: number;
  outlineHeight: number;
  onComplete: () => void;
  shouldDetect: boolean;
  shouldShowInstructions: boolean;
  onStatusChange: (currStatus: string | undefined) => void;
  autocaptureKind: AutocaptureKind;
};

const useAutoCapture = ({
  videoRef,
  canvasRef,
  mediaStream,
  outlineWidth,
  outlineHeight,
  onComplete,
  onStatusChange,
  autocaptureKind,
  shouldShowInstructions,
  shouldDetect,
}: AutoCaptureProps) => {
  const successCount = useRef(0);
  const rearrangedParams = useRef({ params, currentIndex: 0 });
  const pastStatus = useRef<FaceStatus | CardCaptureStatus | undefined>(
    FaceStatus.detecting,
  );
  const videoSize = useSize(videoRef);
  const { getFaceStatus } = useFaceDetection();
  const [isCaptured, setIsCaptured] = useState(false);
  const { cv, loaded } = useOpenCv();
  const [shouldAutocapture, setShouldAutocapture] = useState(false);

  useTimeout(() => setShouldAutocapture(true), AUTOCAPTURE_DELAY);

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
        videoSize.height,
      );

      if (autocaptureKind === 'document') {
        if (!cv) return;

        // Get the dimensions in video source that corresponds to the frame outline with some cushion
        const sourceDimensions = getSourceDimensions({
          videoRef,
          mediaStream,
          desiredImageWidth,
          desiredImageHeight,
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
          successCount.current += 1;
          rearrangedParams.current = rearrangeParams(
            paramIndex,
            rearrangedParams.current.params,
          );
          if (!shouldShowInstructions) onStatusChange(CardCaptureStatus.OK);
        } else {
          const currIndex = rearrangedParams.current.currentIndex;
          const totalParams = rearrangedParams.current.params.length;
          let newIndex = currIndex + DOC_DETECTION_PARAMS_BATCH_SIZE;
          if (newIndex >= totalParams) newIndex = 0;
          rearrangedParams.current.currentIndex = newIndex;
          if (pastStatus.current === cardCaptureStatus) {
            if (!shouldShowInstructions) onStatusChange(pastStatus.current); // We remove the "hold still" message that corresponds to "OK" status only if we get two consecutive non-OK status
          }
        }
        if (rearrangedParams.current.currentIndex === 0)
          pastStatus.current = cardCaptureStatus; // We only update the past status if it did one complete pass through the params or succeeded in detection
      } else if (autocaptureKind === 'face') {
        const faceStatus = await getFaceStatus(
          videoRef.current,
          videoSize.width,
          videoSize.height,
          { width: outlineWidth, height: outlineWidth },
        );
        if (faceStatus === FaceStatus.OK) {
          successCount.current += 1;
          if (!shouldShowInstructions) onStatusChange(FaceStatus.OK);
        } else if (pastStatus.current === faceStatus) {
          if (!shouldShowInstructions) onStatusChange(pastStatus.current); // We remove the "hold still" message that corresponds to "OK" status only if we get two consecutive non-OK status
        }
        pastStatus.current = faceStatus;
      }
    };

    const id = setInterval(
      async () => {
        if (shouldAutocapture) detectAndCapture();
        if (successCount.current >= REQUIRED_SUCCESSES) {
          onComplete();
          clearInterval(id);
          setIsCaptured(true);
        }
      },
      autocaptureKind === 'face' ? SELFIE_CHECK_INTERVAL : undefined, // Since we are checking params in small batches, we don't want to delay more than what it requires to performs the detection. So, we use undefined delay for doc capture
    );
    return () => clearInterval(id);
  }, [
    autocaptureKind,
    canvasRef,
    cv,
    getFaceStatus,
    isCaptured,
    loaded,
    mediaStream,
    onComplete,
    onStatusChange,
    outlineHeight,
    outlineWidth,
    shouldAutocapture,
    shouldDetect,
    shouldShowInstructions,
    videoRef,
    videoSize,
  ]);
};

export default useAutoCapture;
