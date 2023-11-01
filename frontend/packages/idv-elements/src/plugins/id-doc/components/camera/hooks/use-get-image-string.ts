import { useOpenCv } from 'opencv-react-ts';
import type { MutableRefObject } from 'react';

import Logger from '../../../../../utils/logger';
import getSourceDimensions from '../utils/get-source-dimensions';
import { sharpenImage } from '../utils/graphics-utils/graphics-processing-utils';
import type { AutocaptureKind } from './use-auto-capture';

type GetImageStringProps = {
  context: CanvasRenderingContext2D;
  videoRef: MutableRefObject<HTMLVideoElement | undefined>;
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  mediaStream: MediaStream | null;
  desiredImageWidth: number;
  desiredImageHeight: number;
  autocaptureKind: AutocaptureKind;
  centerOffsetX?: number;
  centerOffsetY?: number;
};

const ERROR_MARGIN = -10; // to avoid rouding error, we are using this value for now. TODO: test the dimension logic more to understand why rounding errors may occur in the first place.

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
    centerOffsetX,
    centerOffsetY,
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

    if (sx < ERROR_MARGIN || sy < ERROR_MARGIN || sWidth <= 0 || sHeight <= 0) {
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

    if (loaded && cv && autocaptureKind === 'document') {
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
