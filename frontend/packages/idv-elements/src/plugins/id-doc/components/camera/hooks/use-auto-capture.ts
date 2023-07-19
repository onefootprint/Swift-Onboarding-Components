import { useOpenCv } from 'opencv-react-ts';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

import getSourceDimensions from '../utils/get-source-dimensions';
import {
  CardCaptureStatus,
  getCardCaptureStatus,
} from '../utils/graphics-utils/graphics-processing-utils';
import { params, ParamsType } from '../utils/graphics-utils/params';
import useFaceDetection, { FaceStatus } from './use-face-detection';
import useSize from './use-size';

// We send a new capture from video every 200 milliseconds
const CHECK_INTERVAL = 200;

// We will check if 2 consecutive tries were successful before considering it a complete success
const REQUIRED_CONSECUTIVE_SUCCESS = 2;

// We allow 40 pixels offset outside the card outline (20 pixels each side) along the width
const WIDTH_ERROR_OFFSET = 40;

// We allow 30 pixels offset outside the card outline (10 pixels each side) along the height
const HEIGHT_ERROR_OFFSET = 30;

export type AutocaptureKind = 'document' | 'face';

type AutoCaptureProps = {
  videoRef: MutableRefObject<HTMLVideoElement | undefined>;
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  mediaStream: MediaStream | null;
  outlineWidth: number;
  outlineHeight: number;
  onCapture: () => void;
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
  onCapture,
  onStatusChange,
  autocaptureKind,
  shouldShowInstructions,
  shouldDetect,
}: AutoCaptureProps) => {
  const successCount = useRef(0);
  const rearrangedParams = useRef(params);
  const pastStatus = useRef<FaceStatus | CardCaptureStatus | undefined>(
    FaceStatus.detecting,
  );
  const videoSize = useSize(videoRef);
  const { getFaceStatus } = useFaceDetection();
  const [isCaptured, setIsCaptured] = useState(false);
  const { cv, loaded } = useOpenCv();

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
      return newParams;
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
        canvasRef.current.setAttribute('width', `${sourceDimensions.sWidth}`);
        canvasRef.current.setAttribute('height', `${sourceDimensions.sHeight}`);

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
          rearrangedParams.current,
          cv,
          loaded,
        );

        if (cardCaptureStatus === CardCaptureStatus.OK) {
          successCount.current += 1;
          rearrangedParams.current = rearrangeParams(
            paramIndex,
            rearrangedParams.current,
          );
          if (!shouldShowInstructions) onStatusChange(CardCaptureStatus.OK);
        } else if (pastStatus.current === cardCaptureStatus) {
          if (!shouldShowInstructions) onStatusChange(pastStatus.current); // We remove the "hold still" message that corresponds to "OK" status only if we get two consecutive non-OK status
        }
        pastStatus.current = cardCaptureStatus;
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

    const id = setInterval(async () => {
      detectAndCapture();
      if (successCount.current >= REQUIRED_CONSECUTIVE_SUCCESS) {
        onCapture();
        clearInterval(id);
        setIsCaptured(true);
      }
    }, CHECK_INTERVAL);
    return () => clearInterval(id);
  }, [
    autocaptureKind,
    canvasRef,
    cv,
    getFaceStatus,
    isCaptured,
    loaded,
    mediaStream,
    onCapture,
    onStatusChange,
    outlineHeight,
    outlineWidth,
    shouldDetect,
    shouldShowInstructions,
    videoRef,
    videoSize,
  ]);
};

export default useAutoCapture;
