import React from 'react';

import useAutoCaptureFace from './hooks/use-auto-capture-face';
import type { CaptureStatus, Resolution, VideoRef } from './types';

type AutoCaptureFaceProps = {
  canvasAutoCaptureRef: React.MutableRefObject<HTMLCanvasElement | undefined>;
  feedbackPositionFromBottom: number;
  isCaptured: boolean;
  onDetectionComplete: () => void;
  onDetectionReset: () => void;
  outlineWidth: number;
  setAutocaptureFeedback: (x?: CaptureStatus) => void;
  videoRef: VideoRef;
  videoSize: Resolution | undefined;
};

const AutoCaptureFace = ({
  canvasAutoCaptureRef,
  feedbackPositionFromBottom,
  isCaptured,
  onDetectionComplete,
  onDetectionReset,
  outlineWidth,
  setAutocaptureFeedback,
  videoRef,
  videoSize,
}: AutoCaptureFaceProps): null => {
  useAutoCaptureFace({
    canvasRef: canvasAutoCaptureRef,
    isCaptured,
    onDetectionComplete,
    onDetectionReset,
    onStatusChange: setAutocaptureFeedback,
    outlineOffsetY: -feedbackPositionFromBottom / 2, // Negative Y direction (upward)
    outlineWidth,
    videoRef,
    videoSize,
  });

  return null;
};

export default React.memo(AutoCaptureFace);
