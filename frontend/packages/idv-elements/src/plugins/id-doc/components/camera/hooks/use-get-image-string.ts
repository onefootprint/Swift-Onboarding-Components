import { useOpenCv } from 'opencv-react-ts';
import { MutableRefObject } from 'react';

import getSourceDimensions from '../utils/get-source-dimensions';
import { sharpenImage } from '../utils/graphics-utils/graphics-processing-utils';

type GetImageStringProps = {
  context: CanvasRenderingContext2D;
  videoRef: MutableRefObject<HTMLVideoElement | undefined>;
  canvasRef: MutableRefObject<HTMLCanvasElement | undefined>;
  mediaStream: MediaStream | null;
  desiredImageWidth: number;
  desiredImageHeight: number;
  shouldSharpen: boolean;
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
    shouldSharpen,
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

    if (loaded && cv && shouldSharpen) {
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
