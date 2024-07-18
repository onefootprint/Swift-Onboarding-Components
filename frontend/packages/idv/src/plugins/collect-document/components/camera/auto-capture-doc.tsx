import React from 'react';

import useAutoCaptureDoc from './hooks/use-auto-capture-doc';
import type { CaptureStatus, Resolution, VideoRef } from './types';

type AutoCaptureDocProps = {
  canvasAutoCaptureRef: React.MutableRefObject<HTMLCanvasElement | undefined>;
  feedbackPositionFromBottom: number;
  isCaptured: boolean;
  mediaStream: MediaStream | null;
  onDetectionComplete: () => void;
  onDetectionReset: () => void;
  outlineHeight: number;
  outlineWidth: number;
  setAutocaptureFeedback: (x?: CaptureStatus) => void;
  videoRef: VideoRef;
  videoSize: Resolution | undefined;
};

const AutoCaptureDoc = ({
  canvasAutoCaptureRef,
  feedbackPositionFromBottom,
  isCaptured,
  mediaStream,
  onDetectionComplete,
  onDetectionReset,
  outlineHeight,
  outlineWidth,
  setAutocaptureFeedback,
  videoRef,
  videoSize,
}: AutoCaptureDocProps): null => {
  useAutoCaptureDoc({
    canvasRef: canvasAutoCaptureRef,
    isCaptured,
    mediaStream,
    onDetectionComplete,
    onDetectionReset,
    onStatusChange: setAutocaptureFeedback,
    outlineHeight,
    outlineOffsetY: -feedbackPositionFromBottom / 2, // Negative Y direction (upward)
    outlineWidth,
    videoRef,
    videoSize,
  });

  return null;
};

export default React.memo(AutoCaptureDoc);
