import React from 'react';

import useAutoCaptureFace from './hooks/use-auto-capture-face';
import type { CaptureStatus, Resolution, VideoRef } from './types';

export type AutoCaptureFaceProps = {
  canvasAutoCaptureRef: React.MutableRefObject<HTMLCanvasElement | undefined>;
  feedbackPositionFromBottom: number;
  isCaptured: boolean;
  onDetectionComplete: () => void;
  onDetectionReset: () => void;
  outlineWidth: number;
  setAutoCaptureFeedback: (x?: CaptureStatus) => void;
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
  setAutoCaptureFeedback,
  videoRef,
  videoSize,
}: AutoCaptureFaceProps): null => {
  useAutoCaptureFace({
    canvasRef: canvasAutoCaptureRef,
    isCaptured,
    onDetectionComplete,
    onDetectionReset,
    onStatusChange: setAutoCaptureFeedback,
    outlineOffsetY: -feedbackPositionFromBottom / 2, // Negative Y direction (upward)
    outlineWidth,
    videoRef,
    videoSize,
  });

  return null;
};

export default React.memo(AutoCaptureFace);
