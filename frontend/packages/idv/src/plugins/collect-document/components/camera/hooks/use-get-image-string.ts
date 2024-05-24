import { useOpenCv } from 'opencv-react-ts';
import type { MutableRefObject } from 'react';

import { Logger } from '../../../../../utils/logger';
import type { AutocaptureKind, VideoRef } from '../types';
import getSourceDimensions from '../utils/get-source-dimensions';
import { sharpenImage } from '../utils/graphics-utils/graphics-processing-utils';

type GetImageStringProps = {
  context: CanvasRenderingContext2D;
  videoRef: VideoRef;
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  mediaStream: MediaStream | null;
  desiredImageWidth: number;
  desiredImageHeight: number;
  autocaptureKind: AutocaptureKind;
  centerOffsetX?: number;
  centerOffsetY?: number;
};

const useGetImageString = () => {
  const { cv, loaded } = useOpenCv();

  const getImageStringFromVideo = ({
    context,
    videoRef,
    canvasRef,
    mediaStream,
    desiredImageWidth,
    desiredImageHeight,
    autocaptureKind,
    centerOffsetX = 0,
    centerOffsetY = 0,
  }: GetImageStringProps) => {
    if (!videoRef.current || !canvasRef.current) return null;

    const sourceDimensions = getSourceDimensions({
      videoRef,
      mediaStream,
      desiredImageWidth,
      desiredImageHeight,
      centerOffsetX,
      centerOffsetY,
    });

    const { sx, sy, sWidth, sHeight } = sourceDimensions;

    if (sWidth <= 0 || sHeight <= 0) {
      Logger.error(
        `Computed desired image dimensions is 0 or negative number - sx: ${sx}, sy: ${sy}, width: ${sWidth}, height: ${sHeight}`,
      );
      return null;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    canvasRef.current.setAttribute('width', `${sWidth}`);
    canvasRef.current.setAttribute('height', `${sHeight}`);

    context.drawImage(
      videoRef.current,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      canvasRef.current?.clientWidth,
      canvasRef.current?.clientHeight,
    );

    if (loaded && cv && autocaptureKind !== 'face') {
      const src = cv.imread(canvasRef.current);
      const sharpenedImage = sharpenImage(cv, src, true);
      cv.imshow(canvasRef.current, sharpenedImage);
      sharpenedImage.delete();
    }

    const imageString = canvasRef.current.toDataURL();

    return imageString;
  };

  return getImageStringFromVideo;
};

export default useGetImageString;
