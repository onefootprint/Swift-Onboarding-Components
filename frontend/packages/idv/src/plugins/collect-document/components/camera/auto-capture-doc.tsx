import React from 'react';

import useAutoCaptureDoc from './hooks/use-auto-capture-doc';
import type { CaptureStatus, Resolution, VideoRef } from './types';

export type AutoCaptureDocProps = {
  canvasAutoCaptureRef: React.MutableRefObject<HTMLCanvasElement | undefined>;
  feedbackPositionFromBottom: number;
  isCaptured: boolean;
  videoResolution: Resolution | undefined;
  onDetectionComplete: () => void;
  onDetectionReset: () => void;
  outlineHeight: number;
  outlineWidth: number;
  setAutoCaptureFeedback: (x?: CaptureStatus) => void;
  videoRef: VideoRef;
  videoSize: Resolution | undefined;
};

const AutoCaptureDoc = ({
  canvasAutoCaptureRef,
  feedbackPositionFromBottom,
  isCaptured,
  videoResolution,
  onDetectionComplete,
  onDetectionReset,
  outlineHeight,
  outlineWidth,
  setAutoCaptureFeedback,
  videoRef,
  videoSize,
}: AutoCaptureDocProps): null => {
  useAutoCaptureDoc({
    canvasRef: canvasAutoCaptureRef,
    isCaptured,
    videoResolution,
    onDetectionComplete,
    onDetectionReset,
    onStatusChange: setAutoCaptureFeedback,
    outlineHeight,
    outlineOffsetY: -feedbackPositionFromBottom / 2, // Negative Y direction (upward)
    outlineWidth,
    videoRef,
    videoSize,
  });

  return null;
};

export default React.memo(AutoCaptureDoc);
