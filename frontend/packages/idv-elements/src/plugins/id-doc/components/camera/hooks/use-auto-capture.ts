import { MutableRefObject, useEffect, useRef, useState } from 'react';

import getSourceDimensions from '../utils/get-source-dimensions';
import {
  CardCaptureStatus,
  getCardCaptureStatus,
} from '../utils/graphics-utils/graphics-processing-utils';
import useFaceDetection, { FaceStatus } from './use-face-detection';
import useSize from './use-size';

// We send a new capture from video every 200 milliseconds
const CHECK_INETERVAL = 200;

// We will check if 3 consecutive tries were successful before considering it a complete success
const REQUIRED_CONSECUTIVE_SUCCESS = 3;

// We allow 30 pixels offset outside the card outline (15 pixels each side) along the width
const WIDTH_ERROR_OFFSET = 30;

// We allow 20 pixels offset outside the card outline (10 pixels each side) along the height
const HEIGHT_ERROR_OFFSET = 20;

export type AutocaptureKind = 'document' | 'face';

type AutoCaptureProps = {
  videoRef: MutableRefObject<HTMLVideoElement | undefined>;
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  outlineWidth: number;
  outlineHeight: number;
  onCapture: () => void;
  onStatusChange: (currStatus: string | undefined) => void;
  autocaptureKind: AutocaptureKind;
};

const useAutoCapture = ({
  videoRef,
  canvasRef,
  outlineWidth,
  outlineHeight,
  onCapture,
  onStatusChange,
  autocaptureKind,
}: AutoCaptureProps) => {
  const successCount = useRef(0);
  const pastStatus = useRef<FaceStatus | CardCaptureStatus | undefined>(
    FaceStatus.detecting,
  );
  const videoSize = useSize(videoRef);
  const { getFaceStatus } = useFaceDetection();
  const [isCaptured, setIsCaptured] = useState(false);

  useEffect(() => {
    const detectAndCapture = async () => {
      const context = canvasRef.current?.getContext('2d');
      if (
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

      if (autocaptureKind === 'document') {
        const sourceDimensions = getSourceDimensions({
          videoRef,
          desiredImageWidth: outlineWidth + WIDTH_ERROR_OFFSET,
          desiredImageHeight: outlineHeight + HEIGHT_ERROR_OFFSET,
        });
        context.drawImage(
          videoRef.current,
          sourceDimensions.sx,
          sourceDimensions.sy,
          sourceDimensions.sWidth,
          sourceDimensions.sHeight,
          0,
          0,
          videoRef.current?.clientWidth,
          videoRef.current?.clientHeight,
        );
        const cardCaptureStatus = getCardCaptureStatus(canvasRef.current);
        if (cardCaptureStatus === CardCaptureStatus.OK) {
          successCount.current += 1;
          onStatusChange(CardCaptureStatus.OK);
        } else if (pastStatus.current === cardCaptureStatus) {
          successCount.current = 0;
          onStatusChange(pastStatus.current);
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
          onStatusChange(FaceStatus.OK);
        } else if (pastStatus.current === faceStatus) {
          successCount.current = 0;
          onStatusChange(pastStatus.current);
        }
        pastStatus.current = faceStatus;
      }
    };

    const id = setInterval(async () => {
      detectAndCapture();
      if (successCount.current === REQUIRED_CONSECUTIVE_SUCCESS) {
        onCapture();
        clearInterval(id);
        setIsCaptured(true);
      }
    }, CHECK_INETERVAL);
    return () => clearInterval(id);
  }, [
    autocaptureKind,
    canvasRef,
    getFaceStatus,
    isCaptured,
    onCapture,
    onStatusChange,
    outlineHeight,
    outlineWidth,
    videoRef,
    videoSize,
  ]);
};

export default useAutoCapture;
