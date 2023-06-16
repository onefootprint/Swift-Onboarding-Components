import { MutableRefObject } from 'react';

import getSourceDimensions from './get-source-dimensions';

type GetImageStringProps = {
  context: CanvasRenderingContext2D;
  videoRef: MutableRefObject<HTMLVideoElement | undefined>;
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  desiredImageWidth: number;
  desiredImageHeight: number;
};

const getImageStringFromVideo = ({
  context,
  videoRef,
  canvasRef,
  desiredImageWidth,
  desiredImageHeight,
}: GetImageStringProps) => {
  if (!videoRef.current || !canvasRef.current) return null;

  const sourceDimensions = getSourceDimensions({
    videoRef,
    desiredImageWidth,
    desiredImageHeight,
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

  const imageString = canvasRef.current.toDataURL();

  return imageString;
};

export default getImageStringFromVideo;
