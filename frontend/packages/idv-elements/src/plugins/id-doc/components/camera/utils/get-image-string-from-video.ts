import { MutableRefObject } from 'react';

import getSourceDimensions from './get-source-dimensions';

type GetImageStringProps = {
  context: CanvasRenderingContext2D;
  videoRef: MutableRefObject<HTMLVideoElement | undefined>;
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  mediaStream: MediaStream | null;
  desiredImageWidth: number;
  desiredImageHeight: number;
};

const getImageStringFromVideo = ({
  context,
  videoRef,
  canvasRef,
  mediaStream,
  desiredImageWidth,
  desiredImageHeight,
}: GetImageStringProps) => {
  if (!videoRef.current || !canvasRef.current) return null;

  const sourceDimensions = getSourceDimensions({
    videoRef,
    mediaStream,
    desiredImageWidth,
    desiredImageHeight,
  });

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  canvasRef.current.setAttribute('width', `${sourceDimensions.sWidth}`);
  canvasRef.current.setAttribute('height', `${sourceDimensions.sHeight}`);

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

  const imageString = canvasRef.current.toDataURL();

  return imageString;
};

export default getImageStringFromVideo;
