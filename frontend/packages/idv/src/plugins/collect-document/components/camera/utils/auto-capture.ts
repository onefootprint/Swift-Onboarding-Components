import type { MutableRefObject } from 'react';

import type { DocSrcDimensions, VideoRef, VideoSize } from '../types';
import getSourceDimensions from './get-source-dimensions';

const HEIGHT_ERROR_OFFSET = 30; // We allow 30 pixels offset outside the card outline (10 pixels each side) along the height
const WIDTH_ERROR_OFFSET = 40; // We allow 40 pixels offset outside the card outline (20 pixels each side) along the width

const getDesiredImgSize = (
  videoSize: VideoSize,
  outlineWidth: number,
  outlineHeight: number,
  outlineOffsetY: number | undefined,
) => ({
  width: Math.min(outlineWidth + WIDTH_ERROR_OFFSET, videoSize.width),
  height: Math.min(outlineHeight + HEIGHT_ERROR_OFFSET, videoSize.height + (outlineOffsetY ?? 0) * 2),
});

const computeSrcDimensions = (
  videoSize: VideoSize,
  outlineWidth: number,
  outlineHeight: number,
  outlineOffsetY: number | undefined,
  videoRef: VideoRef,
  mediaStream: MediaStream | null,
  outlineOffsetX: number | undefined,
) => {
  const desired = getDesiredImgSize(videoSize, outlineWidth, outlineHeight, outlineOffsetY);

  // Get the dimensions in video source that corresponds to the frame outline with some cushion
  const sourceDimensions = getSourceDimensions({
    videoRef,
    mediaStream,
    desiredImageWidth: desired.width,
    desiredImageHeight: desired.height,
    centerOffsetX: outlineOffsetX,
    centerOffsetY: outlineOffsetY,
  });
  return sourceDimensions;
};

export const docDrawer = (
  dimensions: DocSrcDimensions | undefined,
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>,
  videoRef: VideoRef,
): HTMLCanvasElement | undefined => {
  if (!dimensions || !canvasRef.current || !videoRef.current) {
    return undefined;
  }

  const refCanvas = canvasRef.current; // Lower the size of the canvas so that autocapture algorithm runs faster
  refCanvas.width = Math.floor(dimensions.sWidth / 4); // eslint-disable-line no-param-reassign
  refCanvas.height = Math.floor(dimensions.sHeight / 4); // eslint-disable-line no-param-reassign

  const context = refCanvas?.getContext('2d', { willReadFrequently: true });
  if (!context) return undefined;

  context.drawImage(
    videoRef.current,
    dimensions.sx,
    dimensions.sy,
    dimensions.sWidth,
    dimensions.sHeight,
    0,
    0,
    refCanvas?.clientWidth,
    refCanvas?.clientHeight,
  );

  return refCanvas;
};

export default computeSrcDimensions;
